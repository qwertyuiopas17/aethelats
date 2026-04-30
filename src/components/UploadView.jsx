import React from 'react';
import { UploadCloud, FileText, XCircle, RefreshCw, Zap, Check, Play, Sparkles, Cpu } from 'lucide-react';
import { ToggleSwitch } from './UIHelpers';
import { JDAnalysisSection } from './AnalysisPanels';
import { ArchitectureDiagram } from './CompliancePanels';
import { DEMO_JD_RESULT } from './constants';

export default function UploadView({ s }) {
  return (
    <div className="p-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="mb-1 flex items-center gap-2"><span className="text-white/80 text-xs">◈</span><span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">Compliance Engine</span></div>
          <h1 className="text-3xl font-bold text-white mb-3">Resume Bias Audit</h1>
          <p className="text-white/90 text-sm max-w-xl leading-relaxed mb-8">Upload candidate profiles to scan for unconscious bias indicators in formatting, language, and institutional markers. Engineered for objective evaluation.</p>
          <div className="mb-6 max-w-xl">
            <label className="block text-xs font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-2">Target Role
              {s.detectingRole && <span className="flex items-center gap-1.5 text-white/90 font-normal normal-case tracking-normal"><RefreshCw className="w-3 h-3 animate-spin" />Detecting...</span>}
              {!s.detectingRole && s.jobRole && s.selectedFile && <span className="flex items-center gap-1 text-white font-normal normal-case tracking-normal"><Check className="w-3 h-3" />Detected</span>}
            </label>
            <input type="text" value={s.jobRole} onChange={e => s.setJobRole(e.target.value)} placeholder={s.detectingRole ? 'Detecting...' : 'e.g. Full Stack Engineer'} disabled={s.detectingRole}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white placeholder-white/20" />
          </div>
          <input ref={s.fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif" style={{ display: 'none' }} onChange={e => s.handleFileSelect(e.target.files[0])} />
          {!s.selectedFile ? (
            <div onClick={() => s.fileInputRef.current.click()} onDragOver={e => { e.preventDefault(); s.setDragOver(true); }} onDragLeave={() => s.setDragOver(false)}
              onDrop={e => { e.preventDefault(); s.setDragOver(false); s.handleFileSelect(e.dataTransfer.files[0]); }}
              className={'relative rounded-2xl border border-dashed cursor-pointer transition-all duration-500 var(--bezier-smooth) flex flex-col items-center justify-center py-20 group ' + (s.dragOver ? 'border-white/40 bg-white/[0.04]' : 'border-white/10 bg-black hover:border-white/30 hover:bg-white/[0.02]')}
              style={{ boxShadow: s.dragOver ? 'inset 0 0 40px rgba(255,255,255,0.05)' : 'none' }}>
              <div className={'w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 border ' + (s.dragOver ? 'bg-white/10 border-white/20 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-white/[0.02] border-white/[0.05] group-hover:border-white/20 group-hover:bg-white/[0.05] group-hover:scale-105')}>
                <UploadCloud className="w-8 h-8 text-white group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Drag & Drop Resumes</h3>
              <p className="text-white/90 text-sm mb-1">Supported formats: PDF, DOCX, TXT. System automatically</p>
              <p className="text-white/90 text-sm mb-5">redacts Personally Identifiable Information (PII) prior to analysis.</p>
              <button className="px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase btn-premium">Select Files</button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 glass-card glass-card-hover p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center"><FileText className="w-7 h-7 text-white/90" /></div>
              <div className="flex-1">
                <div className="font-semibold text-white mb-0.5">{s.selectedFile.name}</div>
                <div className="text-xs text-white/80">{(s.selectedFile.size / 1024).toFixed(1)} KB · Ready for analysis</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { s.setSelectedFile(null); if (s.fileInputRef.current) s.fileInputRef.current.value = ''; }} className="p-2 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"><XCircle className="w-5 h-5" /></button>
                <button onClick={s.startScan} disabled={s.detectingRole || !s.jobRole}
                  className={'px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all active:scale-95 flex items-center gap-2 ' + (s.detectingRole || !s.jobRole ? 'opacity-40 cursor-not-allowed' : '')}>
                  <Zap className="w-4 h-4" />Analyze
                </button>
              </div>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3 items-center">
            <button onClick={s.loadDemo} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.08] transition-colors ml-auto">
              <Play className="w-3.5 h-3.5" />Try Sample Demo
            </button>
          </div>
          <ArchitectureDiagram />
          <JDAnalysisSection jdText={s.jdText} setJdText={s.setJdText} jdResult={s.jdResult} analyzing={s.jdAnalyzing} onAnalyze={s.handleJDAnalysis} expanded={s.jdExpanded} setExpanded={s.setJdExpanded} isDemo={s.isDemo} demoResult={DEMO_JD_RESULT} />
        </div>
        <div className="space-y-4">
          <div className="glass-card glass-card-hover rounded-2xl p-5 hover-glow scroll-animate">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4">Audit Engine Status</div>
            <div className="flex items-center gap-2 mb-3"><span className="w-2 h-2 rounded-full bg-white animate-pulse" /><span className="text-sm font-semibold text-white">Neural Net Active</span><span className="text-xs text-white/80 ml-auto">0ms latency</span></div>
            <div className="border-t border-white/[0.06] pt-3 mt-3"><div className="flex justify-between text-xs mb-2"><span className="text-white/90">Processing Capacity</span><span className="font-bold text-white">98%</span></div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-white/40 rounded-full" style={{ width: '98%' }} /></div>
            </div>
          </div>
          <div className="glass-card glass-card-hover rounded-2xl p-5 hover-glow scroll-animate">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4">Recent Scans</div>
            {[{ name: 'Q3 Executive Batch', files: '24 files', time: '12m ago' }, { name: 'J.Doe_Resume_Final.pdf', files: '1 file', time: '1h ago' }, { name: 'Engineering Leads', files: '8 files', time: '3h ago' }].map((scan, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs text-white/80"><FileText className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0"><div className="text-sm font-medium text-white truncate">{scan.name}</div><div className="text-xs text-white/80">{scan.files} • {scan.time}</div></div>
                <span className="text-white group-hover:text-white transition-colors">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 glass-card glass-card-hover rounded-2xl p-5 scroll-animate">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Audit Parameters</div>
          <button className="text-xs text-white/80 flex items-center gap-1 hover:text-white transition-colors">⚙ Advanced</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover-border-brighten">
            <div><div className="text-sm font-semibold text-white">PII Redaction</div><div className="text-xs text-white/80 mt-0.5">Remove names, addresses, emails</div></div>
            <ToggleSwitch active={s.piiRedaction} onToggle={() => s.setPiiRedaction(v => !v)} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover-border-brighten">
            <div><div className="text-sm font-semibold text-white">Institution Masking</div><div className="text-xs text-white/80 mt-0.5">Obscure university/company names</div></div>
            <ToggleSwitch active={s.instMasking} onToggle={() => s.setInstMasking(v => !v)} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover-border-brighten">
            <div><div className="text-sm font-semibold text-white">Gendered Language</div><div className="text-xs text-white/80 mt-0.5">Flag potentially biased semantics</div></div>
            <ToggleSwitch active={s.genderedLang} onToggle={() => s.setGenderedLang(v => !v)} />
          </div>
        </div>
      </div>
    </div>
  );
}
