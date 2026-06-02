import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, RefreshCw, User, ChevronRight, Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { API_URL } from './constants';

const SUGGESTED_QUESTIONS = [
  "What salary should I expect for my role and experience?",
  "Which skills should I learn next to reach the next level?",
  "How do I transition from a service company to a product company?",
  "What are the top companies hiring for my role in India right now?",
  "Give me a 3-month action plan to close my skill gaps.",
  "How do I negotiate a higher salary offer?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <Sparkles className="w-4 h-4 text-white/70" />
      </div>
      <div className="px-5 py-3.5 rounded-2xl rounded-bl-sm glass-card shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl border border-white/[0.08]">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-3 animate-fade-in-up transition-all duration-500 ease-out ${isUser ? 'flex-row-reverse' : ''}`}
         style={{ animationFillMode: 'both' }}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform duration-500 hover:scale-110 ${
        isUser
          ? 'bg-white/[0.05] border border-white/[0.15]'
          : 'bg-white/[0.02] border border-white/[0.1]'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white/80" />
          : <Sparkles className="w-4 h-4 text-white/60" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] px-5 py-4 rounded-3xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_8px_40px_rgba(255,255,255,0.05)] ${
        isUser
          ? 'rounded-br-sm bg-white/10 border border-white/[0.15] text-white'
          : 'rounded-bl-sm bg-[#0c0c0c]/80 border border-white/[0.06] text-white/90'
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AiCoachView({ s }) {
  const result = s?.result;
  const hasResult = !!result;

  // Extract resume context
  const resumeSkills = result?.structured_data?.technical_skills || [];
  const missingSkills = (result?.gaps || []).map(g => g.gap).filter(Boolean);
  const targetRole = s?.jobRole || '';
  const fairaiScore = result?.fit_score ?? null;
  const legacyScore = result?.counterfactual?.legacy_ats_score ?? null;
  const experienceYears = result?.structured_data?.work_experience_summary?.total_years ?? null;
  // Proof-of-work / GitHub context from the scan result
  const proofScore = result?.proof_score ?? null;
  const proofSignals = (result?.proof_breakdown || []).map(b => b.signal).filter(Boolean);
  const githubUrl = (result?.platform_data || []).find(p => p.platform === 'github')?.url || '';
  // Project descriptions — so coach doesn't hallucinate "no projects"
  const projects = (result?.structured_data?.projects || []).map(p =>
    typeof p === 'string' ? p : (p.name || p.title || JSON.stringify(p))
  ).filter(Boolean).slice(0, 6);
  const hackathons = (result?.structured_data?.hackathons || []).map(h =>
    typeof h === 'string' ? h : (h.name || h.title || '')
  ).filter(Boolean);
  // Candidate name — first name only for personalisation
  const candidateName = (() => {
    const full = result?.structured_data?.name || result?.structured_data?.candidate_name || '';
    return full.trim().split(/\s+/)[0] || '';
  })();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Prevent jarring scroll on first message
    if (messages.length <= 1 && !loading) return;
    
    // Slight delay to ensure DOM has updated before scrolling
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  // Send a welcome message the first time the coach opens with a result
  useEffect(() => {
    if (hasResult && !welcomed && messages.length === 0) {
      setWelcomed(true);
      const greeting = buildGreeting(fairaiScore, targetRole, missingSkills);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResult]);

  function buildGreeting(score, role, gaps) {
    if (!score && !role) {
      return "Hi! I'm your Aethel AI Career Coach. I'm powered by real data from 97,000 Indian job postings. Ask me anything about salaries, skills, career paths, or interview prep!";
    }
    const scoreMsg = score
      ? `Your resume scored **${score}/100**${role ? ` for ${role}` : ''}. `
      : '';
    const gapMsg = gaps.length > 0
      ? `I can see you're missing ${gaps.slice(0, 3).join(', ')}${gaps.length > 3 ? ' and more' : ''}. `
      : '';
    return `Hi! I've reviewed your resume analysis. ${scoreMsg}${gapMsg}\n\nI'm backed by real data from 97,000 Indian job postings — I can tell you exact salary ranges, which skills to learn next, and how to close your gaps. What would you like to know?`;
  }

  async function sendMessage(text) {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setIsContextOpen(false); // Close mobile drawer when asking a question

    try {
      const API_BASE = API_URL || 'https://unded-17-aethel-backend-v3.hf.space';
      const res = await fetch(`${API_BASE}/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-10),
          resume_skills: resumeSkills,
          missing_skills: missingSkills,
          target_role: targetRole,
          fairai_score: fairaiScore,
          legacy_score: legacyScore,
          experience_years: experienceYears,
          candidate_name: candidateName,
          proof_score: proofScore,
          github_url: githubUrl,
          proof_signals: proofSignals,
          projects: projects,
          hackathons: hackathons,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I ran into an issue: ${err.message}. Please try again in a moment.`
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleReset() {
    setMessages([]);
    setWelcomed(false);
    setTimeout(() => {
      const greeting = buildGreeting(fairaiScore, targetRole, missingSkills);
      setMessages([{ role: 'assistant', content: greeting }]);
    }, 100);
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-full flex-1 overflow-hidden bg-black/60 backdrop-blur-xl">

      {/* ── LEFT PANEL: Resume Context ── */}
      <aside className={`
        w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] 
        overflow-y-auto p-6 space-y-6 bg-[#0a0a0a] lg:bg-black/40 
        fixed lg:static inset-x-0 bottom-0 top-20 lg:top-auto z-[100] lg:z-auto transition-transform duration-400 ease-out
        ${isContextOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.05),transparent_70%)]" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <Sparkles className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight">AI Career Coach</div>
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Powered by 97k job postings</div>
            </div>
          </div>
          <button onClick={() => setIsContextOpen(false)} className="lg:hidden p-2 text-white/50 hover:text-white rounded-lg bg-white/5">
            ✕
          </button>
        </div>

        {hasResult ? (
          <div className="space-y-6 relative z-10">
            {/* Score card */}
            {fairaiScore !== null && (
              <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover-lift">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">Your FairAI Score</div>
                <div className="text-5xl font-black text-white tracking-tighter">{fairaiScore}<span className="text-xl text-white/30 font-medium">/100</span></div>
                {targetRole && <div className="text-[11px] font-medium text-white/60 mt-2 tracking-wide">for {targetRole}</div>}
              </div>
            )}

            {/* Skills you have */}
            {resumeSkills.length > 0 && (
              <div className="animate-fade-in-up stagger-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">Detected Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeSkills.slice(0, 12).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide bg-white/[0.03] text-white/80 border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                  {resumeSkills.length > 12 && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide bg-transparent text-white/30 border border-dashed border-white/20">
                      +{resumeSkills.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Skill gaps */}
            {missingSkills.length > 0 && (
              <div className="animate-fade-in-up stagger-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">Skill Gaps</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.slice(0, 8).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide bg-rose-500/[0.05] text-rose-200 border border-rose-500/20 hover:bg-rose-500/10 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-5 text-sm text-white/50 leading-relaxed text-center relative z-10">
            <Zap className="w-6 h-6 text-white/20 mx-auto mb-3" />
            No resume analyzed yet. Analyze a resume first to get personalized coaching — or ask me any general career question!
          </div>
        )}

        {/* Suggested questions */}
        <div className="relative z-10 pt-4 border-t border-white/[0.06]">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3 pl-1">Try asking</div>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="w-full text-left text-[11px] font-medium tracking-wide text-white/60 hover:text-white px-3.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.12] hover-lift transition-all flex items-start gap-2.5 group disabled:opacity-40">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/20 group-hover:text-white/60 transition-colors" />
                <span className="leading-snug">{q}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL: Chat ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />

        {/* Chat header */}
        <div className="shrink-0 flex items-center justify-between px-6 sm:px-8 py-4 border-b border-white/[0.06] bg-black/40 backdrop-blur-md relative z-10">
          <div>
            <div className="text-base font-extrabold text-white tracking-tight">Career Q&A</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5 hidden sm:block">Backed by real Indian job market data</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsContextOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/[0.06] border border-white/20 transition-all">
              Context
            </button>
            <button onClick={handleReset} title="Reset conversation"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.15] hover-lift transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-8 relative z-10">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Sparkles className="w-8 h-8 text-white/80" />
              </div>
              <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">Your AI Career Coach</div>
              <div className="text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed px-4">
                  Ask anything about salaries, skills to learn, career transitions, or interview prep — all backed by 97,000 real Indian job postings.
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input area */}
        <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-white/[0.06] bg-black/60 backdrop-blur-xl relative z-10">
          <div className="max-w-4xl mx-auto flex gap-3 items-end relative">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-white/[0.02] rounded-2xl blur-md transition-all duration-300 group-focus-within:bg-white/[0.04]" />
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about salaries, skills, career paths..."
                rows={1}
                disabled={loading}
                className="w-full resize-none rounded-2xl px-5 py-4 text-sm text-white placeholder-white/30
                  bg-white/[0.03] border border-white/[0.1] focus:border-white/[0.3]
                  focus:outline-none focus:ring-0 transition-all duration-300 leading-relaxed
                  disabled:opacity-50 max-h-32 shadow-inner relative z-10"
                style={{ scrollbarWidth: 'none' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
                disabled:opacity-30 disabled:cursor-not-allowed
                bg-white text-black font-bold border border-white hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]
                hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 z-10"
            >
              {loading
                ? <RefreshCw className="w-5 h-5 animate-spin" />
                : <Send className="w-5 h-5 ml-1" />
              }
            </button>
          </div>
          <div className="hidden sm:block text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 mt-3 text-center">
            Press Enter to send · Shift+Enter for new line · Backed by 97k Indian job postings
          </div>
        </div>
      </div>
    </div>
  );
}
