import React, { Component } from 'react';
import {
  AlertTriangle, Shield, Users, Activity, BarChart2, Settings,
  ChevronRight, RefreshCw, XCircle, Cpu, Play, Bell, HelpCircle,
  FileText, Clock, CheckCircle
} from 'lucide-react';
import { useAppState } from './components/AppLogic';
import { NavItem, FairnessGateModal, getLogColor, LogIcon } from './components/UIHelpers';
import UploadView from './components/UploadView';
import ResultsView from './components/ResultsView';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="max-w-lg glass-card rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-white/40 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Render Error</h2>
          <p className="text-white/40 text-sm font-mono">{this.state.error.message}</p>
        </div>
      </div>
    );
    return this.props.children;
  }
}

export default function App() {
  const s = useAppState();
  const biasProxies = s.result?.bias_proxies || [];
  const recommendation = s.result?.recommendation || 'Schedule Screening Call';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0a0a0a] text-white/80 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

        {s.showFairnessGate && (
          <FairnessGateModal biasProxies={biasProxies} recommendation={recommendation}
            onConfirm={s.handleFairnessConfirm} onCancel={() => s.setShowFairnessGate(false)} />
        )}

        {/* ═══ SIDEBAR ═══ */}
        <aside className="w-56 shrink-0 glass-sidebar hidden md:flex flex-col min-h-screen">
          <div className="px-5 py-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white/60" />
              </div>
              <div>
                <div className="text-lg font-bold text-white tracking-tight">Aethel</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25">Precision Recruitment</div>
              </div>
            </div>
          </div>
          <div className="px-3 py-4">
            <button onClick={s.reset} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-white/70 text-sm font-semibold hover:bg-white/[0.06] transition-all mb-4">
              + Add Candidate
            </button>
          </div>
          <nav className="flex-1 px-3 space-y-0.5">
            <NavItem icon={<Users className="w-4 h-4" />} label="Talent Pool" active={false} />
            <NavItem icon={<Shield className="w-4 h-4" />} label="Audit Trail" active={true} />
            <NavItem icon={<FileText className="w-4 h-4" />} label="Templates" active={false} />
            <NavItem icon={<BarChart2 className="w-4 h-4" />} label="Analytics" active={false} />
            <NavItem icon={<Clock className="w-4 h-4" />} label="History" active={false} />
          </nav>
          <div className="p-4 border-t border-white/[0.06]">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/30 hover:text-white/60 transition-colors">
              <HelpCircle className="w-4 h-4" /> Support
            </button>
          </div>
        </aside>

        {/* ═══ MAIN ═══ */}
        <div className="flex-1 flex flex-col min-h-screen">

          {/* ═══ TOPBAR ═══ */}
          <header className="h-14 shrink-0 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md z-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-8">
              <span className="text-sm font-bold text-white tracking-tight">Aethel ATS</span>
              <nav className="hidden sm:flex items-center gap-6 text-sm text-white/30">
                <span className="nav-link cursor-pointer hover:text-white/70">Pipeline</span>
                <span className={'nav-link cursor-pointer ' + (s.step === 'upload' ? 'active text-white' : 'hover:text-white/70')}>Compliance</span>
                <span className={'nav-link cursor-pointer ' + (s.step === 'results' ? 'active text-white' : 'hover:text-white/70')}>Insights</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {s.step === 'results' && s.result && (
                <span className="text-xs text-white/30 mr-2">
                  {s.isDemo && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-white/40 border border-white/[0.08] mr-2">Demo</span>}
                </span>
              )}
              <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all">
                <Bell className="w-4 h-4 text-white/30" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all">
                <Settings className="w-4 h-4 text-white/30" />
              </button>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white/60 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=aethel" alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = 'HR'; }} />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto relative z-10">

            {/* ═══ UPLOAD ═══ */}
            {s.step === 'upload' && <UploadView s={s} />}

            {/* ═══ SCANNING ═══ */}
            {s.step === 'scanning' && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8 animate-fade-in">
                <div className="relative w-28 h-28 mb-10">
                  <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-3 rounded-full bg-white/[0.06] animate-ping" style={{ animationDuration: '2.8s', animationDelay: '0.4s' }} />
                  <div className="relative w-full h-full bg-[#0a0a0a] border-2 border-white/20 rounded-full flex items-center justify-center" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}>
                    <Cpu className="w-11 h-11 text-white/40 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Compliance Engine Running</h2>
                <p className="text-white/40 text-sm mb-2 text-center max-w-md">Scanning <span className="text-white/60 font-medium">{s.selectedFile?.name}</span> for <span className="text-white/70 font-semibold">{s.jobRole}</span></p>
                <p className="text-white/20 text-xs mb-10">PII stripping + bias-free scoring · 15–40 seconds</p>
                <div className="w-full max-w-lg glass-card rounded-2xl p-6 scan-container">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-white/40 font-medium">Pipeline Progress</span>
                    <span className="text-lg font-bold text-white">{s.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mb-6">
                    <div className="h-full prog-bar-aethel rounded-full transition-all duration-200" style={{ width: s.progress + '%' }} />
                  </div>
                  <div className="space-y-2 font-mono text-xs h-52 overflow-hidden relative">
                    {s.logs.filter(Boolean).map(log => (
                      <div key={log.id} className={'flex items-center gap-2 animate-fade-in-up ' + getLogColor(log.type)}>
                        <LogIcon type={log.type} />{log.text}
                      </div>
                    ))}
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0a0a]/80 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ERROR ═══ */}
            {s.step === 'error' && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8 animate-fade-in">
                <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
                  <XCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
                  <p className="text-white/40 text-sm mb-6 font-mono leading-relaxed">{s.apiError}</p>
                  <div className="text-xs text-white/20 mb-6 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] text-left">
                    <div className="font-semibold text-white/30 mb-1">Troubleshooting:</div>
                    <div>1. Backend: <code className="text-white/50">python -m uvicorn main:app --port 8000</code></div>
                    <div className="mt-1">2. Set <code className="text-white/50">GROQ_API_KEY</code> env var</div>
                    <div className="mt-1">3. Or try <button onClick={s.loadDemo} className="text-white/60 underline">Demo Mode</button></div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button onClick={s.reset} className="px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold transition-colors flex items-center gap-2"><RefreshCw className="w-4 h-4" />Retry</button>
                    <button onClick={s.loadDemo} className="px-6 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 font-semibold transition-colors flex items-center gap-2"><Play className="w-4 h-4" />Demo</button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ RESULTS ═══ */}
            {s.step === 'results' && s.result && <ResultsView s={s} />}

          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
