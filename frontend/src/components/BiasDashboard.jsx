import React, { useState, useEffect } from 'react';
import { BarChart2, RefreshCw, Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Database, Building2, Pause, User, Shuffle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://unded-17-aethel-backend-v3.hf.space';

// ── Animated bar ───────────────────────────────────────────────────
function BiasBar({ value, max }) {
  const isPositive = value >= 0;
  const width = Math.min((Math.abs(value) / max) * 100, 100);
  
  return (
    <div className="flex items-center gap-3 w-full">
      <span className={`text-[11px] font-mono font-bold tracking-widest w-14 shrink-0 text-right text-white`}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}
      </span>
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-sm overflow-hidden relative">
        <div 
          className={`h-full rounded-sm transition-all duration-700 ${isPositive ? 'bg-white' : 'bg-[#555]'}`}
          style={{ width: `${width}%`, marginLeft: isPositive ? '0' : 'auto', marginRight: isPositive ? 'auto' : '0' }}
        />
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-1">
      <div className={`text-2xl font-black ${accent || 'text-white'}`}>{value}</div>
      <div className="text-sm font-semibold text-white">{label}</div>
      {sub && <div className="text-xs text-white/50">{sub}</div>}
    </div>
  );
}

// ── Verdict badge ─────────────────────────────────────────────────
function VerdictBadge({ verdict }) {
  const low = verdict === 'LOW BIAS';
  const mod = verdict === 'MODERATE BIAS';
  return (
    <span className={`text-[10px] font-mono tracking-widest px-2.5 py-1 rounded-sm border ${
      low ? 'bg-white text-black border-white' :
      mod ? 'bg-[#333] text-white border-[#555]' :
            'bg-[#111] text-[#888] border-[#222]'
    }`}>
      {verdict}
    </span>
  );
}

// ── Signal row ────────────────────────────────────────────────────
const SIGNAL_META = {
  delta_institution: { label: 'Institution Prestige', icon: <Building2 className="w-5 h-5" />, desc: 'Score change when uni → MIT' },
  delta_gap:         { label: 'Career Gap',           icon: <Pause className="w-5 h-5" />, desc: 'Score change when gap removed' },
  delta_name:        { label: 'Name (Demographic)',   icon: <User className="w-5 h-5" />, desc: 'Score change when name → Alex Johnson' },
  delta_combined:    { label: 'All Combined',         icon: <Shuffle className="w-5 h-5" />, desc: 'Intersectional amplification' },
};

function SignalRow({ sigKey, value }) {
  const meta = SIGNAL_META[sigKey];
  if (!meta) return null;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <span className="flex items-center justify-center w-7 shrink-0 text-white/70">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{meta.label}</div>
        <div className="text-xs text-white/40">{meta.desc}</div>
      </div>
      <DeltaBar value={value} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function BiasDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [role, setRole]       = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = role ? `?role=${encodeURIComponent(role)}` : '';
      const res = await fetch(`${API_BASE}/bias-comparison${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const models = data?.models || {};
  const modelNames = Object.keys(models);
  const aethel = models['aethel'];
  const sampleCount = data?.sample_count || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-white/70" />
            Bias Audit Dashboard
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Aggregate bias signal deltas across <span className="text-white font-semibold">{sampleCount}</span> counterfactual runs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={role}
            onChange={e => setRole(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData()}
            placeholder="Filter by role…"
            className="px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 w-44"
          />
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3 text-white/50">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Fetching bias audit data…</span>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="glass-card rounded-2xl p-8 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <div className="text-white font-semibold">Could not load dashboard</div>
          <div className="text-white/50 text-sm font-mono">{error}</div>
          <button onClick={fetchData} className="mt-3 px-4 py-2 text-sm font-semibold rounded-xl bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/10 transition-all">
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && sampleCount === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3">
          <Database className="w-10 h-10 text-white/30 mx-auto" />
          <div className="text-white font-semibold">No audit data yet</div>
          <div className="text-white/50 text-sm max-w-sm mx-auto">
            Run the <strong className="text-white">Bias Audit</strong> on a resume (from the Results page) to start populating this dashboard.
          </div>
          <div className="text-xs text-white/30 mt-2">Every counterfactual test is recorded here automatically.</div>
        </div>
      )}

      {/* ── Data view ── */}
      {!loading && !error && sampleCount > 0 && (
        <>
          {/* ── Summary stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Resumes Audited" value={sampleCount} sub="counterfactual runs" accent="text-white" />
            <StatCard
              label="Aethel Total Bias"
              value={aethel ? `${aethel.total_bias} pts` : '—'}
              sub="sum of |Δ| across signals"
              accent="text-white"
            />
            <StatCard
              label="Models Tracked"
              value={modelNames.length}
              sub="evaluator models"
              accent="text-white"
            />
            <StatCard
              label="Aethel Verdict"
              value={aethel?.verdict || '—'}
              sub={aethel?.verdict === 'LOW BIAS' ? '< 5 pts total' : aethel?.verdict === 'MODERATE BIAS' ? '5–15 pts total' : '> 15 pts total'}
              accent="text-white"
            />
          </div>

          {/* ── Overall verdict banner ── */}
          <div className="glass-card rounded-sm p-4 flex items-center gap-3">
            {aethel?.verdict === 'LOW BIAS'
              ? <CheckCircle className="w-5 h-5 text-white shrink-0" />
              : <AlertTriangle className="w-5 h-5 text-[#888] shrink-0" />
            }
            <p className="text-sm text-white/80">{data?.verdict}</p>
          </div>

          {/* ── Per-model signal breakdown ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelNames.map(modelName => {
              const m = models[modelName];
              const isAethel = modelName === 'aethel';
              return (
                <div key={modelName} className={`glass-card rounded-sm p-5 border ${isAethel ? 'border-white' : 'border-[#222]'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {isAethel && <Shield className="w-4 h-4 text-white" />}
                        <span className="font-mono font-bold tracking-widest text-white uppercase">
                          {isAethel ? 'FAIRAI_(AETHEL)' : modelName}
                        </span>
                        {isAethel && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-white border border-white text-black uppercase tracking-widest">
                            BIAS-BLIND
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{m.sample_count} resumes</div>
                    </div>
                    <VerdictBadge verdict={m.verdict} />
                  </div>

                  <div className="space-y-1">
                    {Object.entries(SIGNAL_META).map(([key]) => (
                      m[key] !== undefined && <SignalRow key={key} sigKey={key} value={m[key]} />
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-white/40">Total bias score</span>
                    <span className="text-lg font-mono font-black text-white">
                      {m.total_bias} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── What this means section ── */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-white/60" />
              How to read this dashboard
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/60">
              <div>
                <div className="text-white font-semibold mb-1 flex items-center gap-1.5"><Building2 className="w-4 h-4 text-white/70" /> Institution Prestige</div>
                A positive delta means the model scored the resume higher when the university was replaced with MIT. This is institution-prestige bias.
              </div>
              <div>
                <div className="text-white font-semibold mb-1 flex items-center gap-1.5"><Pause className="w-4 h-4 text-white/70" /> Career Gap</div>
                A negative delta means the model scored the resume lower when the career gap was present. This is gap-penalty bias.
              </div>
              <div>
                <div className="text-white font-semibold mb-1 flex items-center gap-1.5"><User className="w-4 h-4 text-white/70" /> Name Bias</div>
                Any delta here means the model scored differently based on the candidate's perceived demographic signal from their name alone.
              </div>
            </div>
            <div className="text-xs text-white/30 pt-2 border-t border-white/[0.04]">
              Aethel scores are near-zero because PII is stripped before evaluation. Other models show their real bias. Each run on the Bias Audit tab automatically adds a data point here.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
