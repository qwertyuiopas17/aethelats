import React, { Component, useState } from 'react';
import {
  AlertTriangle, Shield, Users, Activity, BarChart2, Settings,
  ChevronRight, RefreshCw, XCircle, Cpu, Play, Bell, HelpCircle,
  FileText, Clock, CheckCircle, Menu, X, LogOut, User, ExternalLink
} from 'lucide-react';
import { useAppState } from './components/AppLogic';
import { NavItem, FairnessGateModal, getLogColor, LogIcon } from './components/UIHelpers';
import LandingView from './components/LandingView';
import UploadView from './components/UploadView';
import ResultsView from './components/ResultsView';
import HorseLoader from './components/HorseLoader';
import BiasDashboard from './components/BiasDashboard';
import TalentPoolView from './components/TalentPoolView';
import AuthView from './components/AuthView';
import { useAuth } from './context/AuthContext';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="max-w-lg glass-card glass-card-hover rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-white/90 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Render Error</h2>
          <p className="text-white/90 text-sm font-mono">{this.state.error.message}</p>
        </div>
      </div>
    );
    return this.props.children;
  }
}

/* ── User initials avatar ── */
function UserAvatar({ name, size = 8 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';
  return (
    <div className={`w-${size} h-${size} rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white`}>
      {initials}
    </div>
  );
}

/* ── Settings/profile dropdown ── */
function UserMenu({ user, onLogout, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-60 glass-card rounded-2xl border border-white/[0.08] shadow-xl z-50 overflow-hidden animate-fade-in">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="text-sm font-bold text-white truncate">{user.name}</div>
        <div className="text-xs text-white/40 truncate">{user.email}</div>
        <div className="mt-1">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
            user.role === 'recruiter'
              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
              : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
          }`}>{user.role}</span>
        </div>
      </div>
      {user.org && (
        <div className="px-4 py-2 border-b border-white/[0.04] flex items-center gap-2 text-xs text-white/40">
          <Shield className="w-3.5 h-3.5" /> {user.org}
        </div>
      )}
      <button
        onClick={() => { onLogout(); onClose(); }}
        className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
}

/* ── Coming Soon badge nav item ── */
function ComingSoonNavItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/25 cursor-default select-none relative group">
      <span className="text-white/20">{icon}</span>
      <span className="text-sm font-medium text-white/25 flex-1">{label}</span>
      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.05] text-white/25 border border-white/[0.06]">
        Soon
      </span>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const { user, isLoggedIn, logout } = useAuth();
  const s = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ── Auth gate ─────────────────────────────────────────────────
  if (!isLoggedIn) return <AuthView />;

  const biasProxies   = s.result?.bias_proxies || [];
  const recommendation = s.result?.recommendation || 'Schedule Screening Call';

  const goToUpload     = () => { s.setStep('upload');      setMobileMenuOpen(false); };
  const loadDemoFromLanding = () => { s.loadDemo();       setMobileMenuOpen(false); };
  const goToLanding    = () => { s.setStep('landing');     setMobileMenuOpen(false); };
  const goToAnalytics  = () => { s.setStep('analytics');  setMobileMenuOpen(false); };
  const goToTalentPool = () => { s.setStep('talent-pool'); setMobileMenuOpen(false); };

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-white flex relative overflow-hidden bg-[#000000] w-full">
        {/* Backgrounds */}
        <div className="bg-grid-pattern fixed z-0" />
        <div className="bg-scan-line fixed z-0" />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)', transform: 'translateZ(0)', willChange: 'transform' }} />

        {s.showFairnessGate && (
          <FairnessGateModal biasProxies={biasProxies} recommendation={recommendation}
            onConfirm={s.handleFairnessConfirm} onCancel={() => s.setShowFairnessGate(false)} />
        )}

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* ═══ SIDEBAR ═══ */}
        <aside className={`w-64 md:w-56 shrink-0 glass-sidebar flex flex-col min-h-screen z-50 !fixed md:!relative transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="px-5 py-6 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/assets/shield_logo.png" alt="Aethel Logo"
                style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.2))' }} />
              <div>
                <div className="text-lg font-bold text-white tracking-tight">Aethel</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white">Precision Recruitment</div>
              </div>
            </div>
            <button className="md:hidden p-1 text-white/50 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-4">
            <button onClick={s.reset} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/[0.06] transition-all mb-4">
              + Add Candidate
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-0.5">
            <NavItem icon={<img src="/assets/shield_logo.png" alt="" className="w-4 h-4 object-contain" />}
              label="Home" active={s.step === 'landing'} onClick={goToLanding} />
            <NavItem icon={<Users className="w-4 h-4" />}
              label="Talent Pool" active={s.step === 'talent-pool'} onClick={goToTalentPool} />
            <NavItem icon={<Shield className="w-4 h-4" />}
              label="Audit Trail" active={s.step === 'upload' || s.step === 'scanning'} onClick={goToUpload} />
            <ComingSoonNavItem icon={<FileText className="w-4 h-4" />} label="Templates" />
            <NavItem icon={<BarChart2 className="w-4 h-4" />}
              label="Analytics" active={s.step === 'analytics'} onClick={goToAnalytics} />
            <ComingSoonNavItem icon={<Clock className="w-4 h-4" />} label="History" />
          </nav>

          {/* User section at bottom */}
          <div className="p-4 border-t border-white/[0.06] space-y-1">
            <button
              onClick={() => window.open('mailto:support@aethel.ai', '_blank')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]"
            >
              <HelpCircle className="w-4 h-4" /> Support
            </button>
            <div className="flex items-center gap-3 px-3 py-2">
              <UserAvatar name={user?.name} size={7} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-white/40 truncate">{user?.role}</div>
              </div>
              <button onClick={logout} className="text-white/30 hover:text-white/70 transition-colors" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* ═══ MAIN ═══ */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full">

          {/* ═══ TOPBAR ═══ */}
          <header className="h-14 shrink-0 border-b border-white/[0.06] backdrop-blur-md z-20 flex items-center justify-between px-4 sm:px-6" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <div className="flex items-center gap-4 sm:gap-8">
              <button className="md:hidden p-1 -ml-1 text-white/80 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <img src="/assets/shield_logo.png" alt="Aethel Logo" className="w-8 h-8 object-contain md:hidden"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(255,255,255,0.2))' }} />
                <span className="text-sm font-bold text-white tracking-tight mt-0.5">Aethel ATS</span>
              </div>
              <nav className="hidden sm:flex items-center gap-6 text-sm text-white/80">
                <span className={'nav-link cursor-pointer ' + (s.step === 'landing' ? 'active text-white' : 'hover:text-white')} onClick={() => s.setStep('landing')}>Home</span>
                <span className="nav-link cursor-pointer text-white/30 cursor-not-allowed" title="Coming soon">Pipeline</span>
                <span className={'nav-link cursor-pointer ' + (s.step === 'upload' || s.step === 'scanning' ? 'active text-white' : 'hover:text-white')} onClick={goToUpload}>Compliance</span>
                <span className={'nav-link cursor-pointer ' + (s.step === 'results' ? 'active text-white' : 'text-white/30 cursor-not-allowed')} title="Complete a scan first">Insights</span>
              </nav>
            </div>

            <div className="flex items-center gap-3 relative">
              {s.step === 'results' && s.result && s.isDemo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-white/90 border border-white/[0.08] mr-1">Demo</span>
              )}
              {/* Notification bell — placeholder */}
              <button
                onClick={() => alert('No new notifications.')}
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-white/80" />
              </button>

              {/* User avatar + dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white hover:bg-white/20 transition-all"
                  title={user?.name}
                >
                  {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : 'ME'}
                </button>
                {userMenuOpen && (
                  <UserMenu user={user} onLogout={logout} onClose={() => setUserMenuOpen(false)} />
                )}
              </div>
            </div>
          </header>

          {/* Close user menu on outside click */}
          {userMenuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
          )}

          <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 w-full">

            {/* ═══ LANDING ═══ */}
            {s.step === 'landing' && <LandingView onGetStarted={goToUpload} onLoadDemo={loadDemoFromLanding} />}

            {/* ═══ UPLOAD ═══ */}
            {s.step === 'upload' && <UploadView s={s} />}

            {/* ═══ SCANNING ═══ */}
            {s.step === 'scanning' && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8 animate-fade-in">
                <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                  <HorseLoader />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Compliance Engine Running</h2>
                <p className="text-white/90 text-sm mb-2 text-center max-w-md">Scanning <span className="text-white font-medium">{s.selectedFile?.name}</span> for <span className="text-white font-semibold">{s.jobRole}</span></p>
                <p className="text-white text-xs mb-10">PII stripping + bias-free scoring · 15–40 seconds</p>
                <div className="w-full max-w-lg glass-card glass-card-hover rounded-2xl p-6 scan-container">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-white/90 font-medium">Pipeline Progress</span>
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
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ERROR ═══ */}
            {s.step === 'error' && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8 animate-fade-in">
                <div className="max-w-md w-full glass-card glass-card-hover rounded-2xl p-8 text-center">
                  <XCircle className="w-12 h-12 text-white/80 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
                  <p className="text-white/90 text-sm mb-6 font-mono leading-relaxed">{s.apiError}</p>
                  <div className="text-xs text-white mb-6 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] text-left">
                    <div className="font-semibold text-white/80 mb-1">Troubleshooting:</div>
                    <div>1. Backend: <code className="text-white">python -m uvicorn main:app --port 8000</code></div>
                    <div className="mt-1">2. Set <code className="text-white">GROQ_API_KEY</code> env var</div>
                    <div className="mt-1">3. Or try <button onClick={s.loadDemo} className="text-white underline">Demo Mode</button></div>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button onClick={s.reset} className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 btn-premium"><RefreshCw className="w-4 h-4" />Retry</button>
                    <button onClick={s.loadDemo} className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 btn-premium"><Play className="w-4 h-4" />Demo</button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ RESULTS ═══ */}
            {s.step === 'results' && s.result && <ResultsView s={s} />}

            {/* ═══ ANALYTICS / BIAS DASHBOARD ═══ */}
            {s.step === 'analytics' && <BiasDashboard />}

            {/* ═══ TALENT POOL ═══ */}
            {s.step === 'talent-pool' && <TalentPoolView />}

          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
