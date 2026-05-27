import React, { Component, useState, useEffect } from 'react';
import {
  AlertTriangle, AlertCircle, Shield, Users, Activity, BarChart2,
  RefreshCw, XCircle, Play, Bell, HelpCircle, Layers,
  FileText, Clock, Menu, X, LogOut, ChevronRight
} from 'lucide-react';
import { useAppState } from './components/AppLogic';
import { NavItem, FairnessGateModal, getLogColor, LogIcon } from './components/UIHelpers';
import LandingView from './components/LandingView';
import UploadView from './components/UploadView';
import ResultsView from './components/ResultsView';
import HorseLoader from './components/HorseLoader';
import BiasDashboard from './components/BiasDashboard';
import TalentPoolView from './components/TalentPoolView';
import BatchUploadView from './components/BatchUploadView';
import AuthView from './components/AuthView';
import PipelineVisualizer from './components/PipelineVisualizer';
import RecruiterVerificationModal from './components/RecruiterVerificationModal';
import { useAuth } from './context/AuthContext';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="max-w-lg glass-card rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-white/90 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Render Error</h2>
          <p className="text-white/90 text-sm font-mono">{this.state.error.message}</p>
        </div>
      </div>
    );
    return this.props.children;
  }
}

/* ── Compact "Coming Soon" nav item ── */
function ComingSoonNavItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/25 cursor-default select-none">
      <span className="text-white/20">{icon}</span>
      <span className="text-sm font-medium text-white/25 flex-1">{label}</span>
      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 border border-white/[0.05]">
        Soon
      </span>
    </div>
  );
}

/* ── Auth modal overlay — wraps AuthView as a dismissible overlay ── */
function AuthModal({ onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* Backdrop — click to dismiss */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Scrollable Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4 py-12">
        {/* Modal content — positioned above backdrop */}
        <div className="relative w-full max-w-4xl animate-scale-in">
        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/[0.08] border border-white/15
            flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15
            transition-all z-20 shadow-xl"
          title="Back to homepage"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Re-use AuthView but with modal styling */}
        <AuthView isModal />
      </div>
      </div>
    </div>
  );
}

/* ── User avatar initials ── */
function UserAvatar({ name }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME';
  return (
    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white">
      {initials}
    </div>
  );
}

/* ── User dropdown ── */
function UserMenu({ user, onLogout, onClose }) {
  if (!user) return null;
  return (
    <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl border border-white/[0.08] shadow-xl z-[100] overflow-hidden animate-fade-in">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="text-sm font-bold text-white truncate">{user.name}</div>
        <div className="text-xs text-white/40 truncate">{user.email}</div>
        <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
          user.role === 'recruiter' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
        }`}>{user.role}</span>
      </div>
      <button
        onClick={() => { onLogout(); onClose(); }}
        className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PUBLIC LANDING — shown to everyone, no auth required
══════════════════════════════════════════════════════════════ */
function PublicLanding({ onSignIn, onGetStarted, onLoadDemo, s }) {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="bg-criss-cross fixed z-0" />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%)' }} />

      {/* Minimal public topbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.05]"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2.5">
          <img src="/assets/shield_logo.png" alt="Aethel" style={{ width: 34, height: 34, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(255,255,255,0.2))' }} />
          <div>
            <div className="text-base font-black text-white tracking-tight">Aethel</div>
            <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 -mt-0.5">Precision Recruitment</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {s?.isDemo && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-white/70 border border-white/[0.08]">Demo</span>
          )}
          <button onClick={onSignIn}
            className="hidden sm:block px-4 py-2 text-sm font-semibold text-white/80 hover:text-white border border-white/[0.10]
              hover:border-white/20 rounded-xl transition-all hover:bg-white/[0.04]">
            Sign In
          </button>
          <button onClick={onGetStarted}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-black bg-white rounded-xl hover:bg-white/90 active:scale-95 transition-all whitespace-nowrap">
            Get Started Free
          </button>
        </div>
      </header>

      {/* Demo mode: show results + sign-up nudge */}
      {s?.isDemo && s?.result ? (
        <div className="relative z-10">
          <div className="px-6 py-3 flex items-center justify-between gap-4 border-b border-white/[0.05]"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-white/60">
              👀 You're viewing a <span className="text-white font-semibold">sample demo</span>. Sign up free to audit your own resume.
            </p>
            <button onClick={onGetStarted}
              className="shrink-0 px-4 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-all">
              Audit My Resume — Free →
            </button>
          </div>
          <ResultsView s={s} />
        </div>
      ) : (
        /* Normal landing content */
        <div className="relative z-10">
          <LandingView onGetStarted={onGetStarted} onLoadDemo={onLoadDemo} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP — shown only when logged in (full sidebar layout)
══════════════════════════════════════════════════════════════ */
function AuthenticatedApp({ s }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen]     = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const biasProxies    = s.result?.bias_proxies || [];
  const recommendation = s.result?.recommendation || 'Schedule Screening Call';

  const goTo = step => { s.setStep(step); setMobileMenuOpen(false); };

  return (
    <div className="min-h-screen text-white flex relative overflow-hidden bg-[#000000] w-full">
      <div className="bg-criss-cross fixed z-0" />
      <div className="bg-scan-line fixed z-0" />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />

      {s.showFairnessGate && (
        <FairnessGateModal biasProxies={biasProxies} recommendation={recommendation}
          onConfirm={s.handleFairnessConfirm} onCancel={() => s.setShowFairnessGate(false)} />
      )}

      {showVerificationModal && (
        <RecruiterVerificationModal onClose={() => setShowVerificationModal(false)} />
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`w-56 shrink-0 glass-sidebar flex flex-col min-h-screen z-[70] !fixed md:!relative transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="px-5 py-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/shield_logo.png" alt="Aethel" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.2))' }} />
            <div>
              <div className="text-lg font-bold text-white tracking-tight">Aethel</div>
              <div className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">Precision Recruitment</div>
            </div>
          </div>
          <button className="md:hidden p-1 text-white/50 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-4">
          <button onClick={s.reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15
              text-white text-sm font-semibold hover:bg-white/[0.06] transition-all mb-4">
            {user?.role === 'candidate' ? '+ Audit Resume' : '+ Add Candidate'}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          <NavItem icon={<img src="/assets/shield_logo.png" alt="" className="w-4 h-4 object-contain" />}
            label="Home" active={s.step === 'landing'} onClick={() => goTo('landing')} />
          <NavItem icon={<Users className="w-4 h-4" />}
            label={user?.role === 'candidate' ? 'My Resumes' : 'Talent Pipeline'} active={s.step === 'talent-pool'} onClick={() => goTo('talent-pool')} />
          {user?.role !== 'candidate' && <ComingSoonNavItem icon={<FileText className="w-4 h-4" />} label="JD Matching" />}
          <ComingSoonNavItem icon={<Activity className="w-4 h-4" />} label="AI Coach" />
          {user?.role !== 'candidate' && (
            <NavItem icon={<Layers className="w-4 h-4" />}
              label="Batch Upload" active={s.step === 'batch'} 
              onClick={() => {
                if (user?.role === 'recruiter' && !user?.is_recruiter_verified) {
                  setShowVerificationModal(true);
                } else {
                  goTo('batch');
                }
              }} />
          )}
          <NavItem icon={<Shield className="w-4 h-4" />}
            label={user?.role === 'candidate' ? 'New Audit' : 'Audit Trail'} active={s.step === 'upload' || s.step === 'scanning'} onClick={() => goTo('upload')} />
          {user?.role !== 'candidate' && (
            <NavItem icon={<BarChart2 className="w-4 h-4" />}
              label="Analytics" active={s.step === 'analytics'} onClick={() => goTo('analytics')} />
          )}
        </nav>

        <div className="p-4 border-t border-white/[0.06] space-y-1">
          <button onClick={() => window.open('mailto:support@aethel.ai', '_blank')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]">
            <HelpCircle className="w-4 h-4" /> Support
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white">
              {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : 'ME'}
            </div>
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

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full">
        {/* TOPBAR */}
        <header className="h-14 shrink-0 border-b border-white/[0.06] backdrop-blur-md z-50 flex items-center justify-between px-4 sm:px-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1 -ml-1 text-white/80 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/assets/shield_logo.png" alt="Aethel Logo" className="w-6 h-6 object-contain" />
              <span className="text-sm font-bold text-white tracking-tight">Aethel ATS</span>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            {s.isDemo && s.step === 'results' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-white/70 border border-white/[0.08]">Demo</span>
            )}
            <button onClick={() => alert('No new notifications.')}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all">
              <Bell className="w-4 h-4 text-white/60" />
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(v => !v)}>
                <UserAvatar name={user?.name} />
              </button>
              {userMenuOpen && <UserMenu user={user} onLogout={logout} onClose={() => setUserMenuOpen(false)} />}
            </div>
          </div>
        </header>
        {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}

        {/* VERIFICATION BANNER */}
        {user?.role === 'recruiter' && !user?.is_recruiter_verified && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-yellow-200">
                Verify your company email to unlock premium features like batch processing.
              </span>
            </div>
            <button 
              onClick={() => setShowVerificationModal(true)}
              className="text-xs font-bold text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 w-full">

          {s.step === 'landing' && (
            <LandingView onGetStarted={() => goTo('upload')} onLoadDemo={s.loadDemo} />
          )}

          {s.step === 'upload' && <UploadView s={s} />}

          {s.step === 'scanning' && (() => {
            const activeStageIndex = Math.min(7, Math.floor((s.progress / 100) * 8));
            return (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">Analyzing Candidate Profile</h2>
                <div className="text-white/60 mb-12 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  Processing pipeline... {s.progress}%
                </div>
                
                <div className="w-full max-w-4xl">
                  <PipelineVisualizer activeStageIndex={activeStageIndex} />
                </div>
                
                <div className="w-full max-w-lg mt-6">
                  {/* Vertical Text Animation Container for logs (smaller footprint now) */}
                  <div className="space-y-3 font-mono text-xs h-32 overflow-hidden relative glass-card p-4 rounded-xl border border-white/[0.08]">
                    {s.logs.filter(Boolean).map(log => (
                      <div key={log.id} className={'flex items-start gap-3 animate-fade-in-up ' + getLogColor(log.type)}>
                        <div className="mt-0.5"><LogIcon type={log.type} /></div>
                        <div className="leading-relaxed">{log.text}</div>
                      </div>
                    ))}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })()}

          {s.step === 'error' && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8 animate-fade-in">
              <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
                <XCircle className="w-12 h-12 text-white/80 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
                <p className="text-white/60 text-sm mb-6 font-mono leading-relaxed">{s.apiError}</p>
                <div className="flex justify-center gap-3">
                  <button onClick={s.reset} className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 btn-premium"><RefreshCw className="w-4 h-4" />Retry</button>
                  <button onClick={s.loadDemo} className="px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 btn-premium"><Play className="w-4 h-4" />Demo</button>
                </div>
              </div>
            </div>
          )}

          {s.step === 'results' && s.result && <ResultsView s={s} />}
          {s.step === 'analytics' && user?.role !== 'candidate' && <BiasDashboard />}
          {s.step === 'talent-pool' && <TalentPoolView />}
          {s.step === 'batch' && user?.role !== 'candidate' && (
            <BatchUploadView
              s={s}
              jobs={s.batchJobs}
              setJobs={s.setBatchJobs}
              batchId={s.batchId}
              setBatchId={s.setBatchId}
              ws={s.batchWs}
              setWs={s.setBatchWs}
              onViewResult={(job) => {
                s.setResult(job.result);
                s.setStep('results');
              }}
            />
          )}

        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT APP — decides what to render based on auth state
══════════════════════════════════════════════════════════════ */
export default function App() {
  const { isLoggedIn } = useAuth();
  const s = useAppState();
  const [showAuth, setShowAuth]     = useState(false);  // auth modal open?
  const [authIntent, setAuthIntent] = useState(null);   // where to go after login

  // When user logs in → close modal and act on intent
  const prevLoggedIn = React.useRef(isLoggedIn);
  useEffect(() => {
    if (!prevLoggedIn.current && isLoggedIn) {
      setShowAuth(false);
      if (authIntent === 'scan') s.setStep('upload');
      else if (authIntent === 'demo') s.loadDemo();
      setAuthIntent(null);
    }
    prevLoggedIn.current = isLoggedIn;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleGetStarted = () => {
    if (isLoggedIn) { s.setStep('upload'); }
    else { setAuthIntent('scan'); setShowAuth(true); }
  };

  const handleLoadDemo = () => {
    s.loadDemo();
    setShowAuth(false);
  };

  const handleSignIn = () => {
    setAuthIntent(null);
    setShowAuth(true);
  };

  // A demo user (not logged in) sees results inside a stripped-down shell
  const showApp = isLoggedIn || s.isDemo;


  return (
    <ErrorBoundary>
      {/* ── LOGGED IN: full authenticated app ── */}
      {isLoggedIn && <AuthenticatedApp s={s} />}

      {/* ── NOT LOGGED IN: public landing (handles demo state internally) ── */}
      {!isLoggedIn && (
        <PublicLanding
          onSignIn={handleSignIn}
          onGetStarted={handleGetStarted}
          onLoadDemo={handleLoadDemo}
          s={s}
        />
      )}

      {/* ── Auth modal ── */}
      {showAuth && !isLoggedIn && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </ErrorBoundary>
  );
}
