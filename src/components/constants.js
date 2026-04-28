export const API_URL = 'http://localhost:8000';
export const MODEL_NAME = 'Llama 3.3 70B via Groq';

export const SCAN_LOGS = [
  { id: 0, text: 'Uploading document to Aethel Compliance Layer...', type: 'info' },
  { id: 1, text: 'Extracting resume content...', type: 'info' },
  { id: 2, text: 'Stage 1/2 — Stripping PII (names, institutions)...', type: 'warn' },
  { id: 3, text: 'Blind evaluation mode activated...', type: 'alert' },
  { id: 4, text: 'Stage 2/2 — Running bias-free scoring with Llama...', type: 'info' },
  { id: 5, text: 'Mapping skill synonyms via knowledge graph...', type: 'info' },
  { id: 6, text: 'Classifying contextual vs declarative skills...', type: 'warn' },
  { id: 7, text: 'Scanning for bias proxy variables...', type: 'alert' },
  { id: 8, text: 'Computing percentile rank against session pool...', type: 'info' },
  { id: 9, text: 'Finalizing compliance audit report...', type: 'success' },
];

export const SEVERITY_STYLE = {
  high:   { bg: 'bg-white/[0.06]', border: 'border-white/20', text: 'text-white' },
  medium: { bg: 'bg-white/[0.03]', border: 'border-white/10', text: 'text-white/70' },
  low:    { bg: 'bg-white/[0.02]', border: 'border-white/[0.08]', text: 'text-white/50' },
};

export const BIAS_TYPE_LABELS = {
  gender:        { label: 'Gender Proxy',  color: 'text-white/80', bg: 'bg-white/[0.05]', border: 'border-white/10' },
  age:           { label: 'Age Proxy',     color: 'text-white/80', bg: 'bg-white/[0.05]', border: 'border-white/10' },
  name:          { label: 'Name Bias',     color: 'text-white/80', bg: 'bg-white/[0.05]', border: 'border-white/10' },
  institution:   { label: 'Institution',   color: 'text-white/80', bg: 'bg-white/[0.05]', border: 'border-white/10' },
  gap:           { label: 'Career Gap',    color: 'text-white/80', bg: 'bg-white/[0.05]', border: 'border-white/10' },
  location:      { label: 'Location',      color: 'text-white/80', bg: 'bg-white/[0.05]', border: 'border-white/10' },
  socioeconomic: { label: 'Socioeconomic', color: 'text-white/80', bg: 'bg-white/[0.05]', border: 'border-white/10' },
};

export const PLATFORM_ICONS = {
  github: '🐙', linkedin: '💼', kaggle: '📊', leetcode: '💻',
  hackerrank: '🎯', codeforces: '⚡', medium: '✍️', devto: '🛠️',
  stackoverflow: '📚', huggingface: '🤗', behance: '🎨', dribbble: '🎨',
  researchgate: '🔬', google_scholar: '🎓', codepen: '🖌️', notion: '📓',
  portfolio: '🌐', other: '🔗',
};

export const DEMO_RESULT = {
  fit_score: 82,
  fit_level: 'Strong Match',
  summary: 'Candidate demonstrates strong full-stack engineering capability through production-grade projects including a real-time collaborative code editor and a distributed task queue system. Open-source contributions and measurable performance optimizations signal high technical impact.',
  radar: { technical_depth:88, problem_solving:85, impact_evidence:78, domain_knowledge:82, project_complexity:90, communication_clarity:74 },
  pii_removed: ['Priya Sharma', 'State University of XYZ', 'Mumbai', '2019', 'paternity leave (8 months)', 'priya.sharma@email.com'],
  percentile: 88,
  pool_size: 47,
  contextual_ratio: 0.71,
  keyword_stuffing_detected: false,
  skill_usage_breakdown: [
    { skill: 'Python', usage_type: 'contextual', evidence: 'Optimized data pipeline using Python, reducing AWS cloud costs by 15%', impact_score: 92 },
    { skill: 'React', usage_type: 'contextual', evidence: 'Built real-time collaborative code editor in React with WebSocket sync for 500+ concurrent users', impact_score: 88 },
    { skill: 'AWS', usage_type: 'contextual', evidence: 'Deployed distributed task queue on AWS ECS handling 50k jobs/day', impact_score: 85 },
    { skill: 'Redis', usage_type: 'contextual', evidence: 'Reduced API response time by 63% via query optimization and Redis caching', impact_score: 78 },
    { skill: 'Docker', usage_type: 'declarative', evidence: 'Skills: Docker, Kubernetes, CI/CD', impact_score: 30 },
    { skill: 'Kubernetes', usage_type: 'declarative', evidence: 'Skills: Docker, Kubernetes, CI/CD', impact_score: 25 },
    { skill: 'PostgreSQL', usage_type: 'contextual', evidence: 'Designed multi-tenant PostgreSQL schema supporting 10k+ users with row-level security', impact_score: 80 },
  ],
  skill_matches: [
    { found_in_resume: 'ReactJS', canonical_name: 'React', match_type: 'synonym' },
    { found_in_resume: 'NodeJS', canonical_name: 'Node.js', match_type: 'synonym' },
    { found_in_resume: 'Seaborn', canonical_name: 'Data Visualization', match_type: 'adjacency' },
    { found_in_resume: 'PySpark', canonical_name: 'Big Data', match_type: 'adjacency' },
    { found_in_resume: 'Python', canonical_name: 'Python', match_type: 'exact' },
    { found_in_resume: 'Postgres', canonical_name: 'PostgreSQL', match_type: 'synonym' },
  ],
  strong_signals: [
    { signal: 'Distributed Systems', evidence: 'Built distributed task queue handling 50k jobs/day on AWS ECS', weight: 'high' },
    { signal: 'Open Source', evidence: 'Maintainer of 1.2k-star React state management library', weight: 'high' },
    { signal: 'Performance Engineering', evidence: 'Reduced API response time by 63% via query optimization', weight: 'medium' },
  ],
  gaps: [
    { gap: 'No formal cloud certification (AWS/GCP)', severity: 'minor' },
    { gap: 'Limited mobile development experience', severity: 'minor' },
  ],
  bias_proxies: [
    { text: '2019 graduation year', bias_type: 'age', severity: 'medium', explanation: 'Legacy ATS treats non-recent graduation years as an age proxy, unfairly penalizing experienced candidates.' },
    { text: 'Paternity leave (8 months)', bias_type: 'gap', severity: 'high', explanation: 'Career gaps are biased against caregivers. A biased ATS would flag this as a "reliability risk" despite being a legally protected leave.' },
    { text: 'State University of XYZ', bias_type: 'institution', severity: 'medium', explanation: 'Systems trained on elite-university employees systematically downrank candidates from non-Tier-1 institutions.' },
    { text: 'Community volunteer, local food bank', bias_type: 'socioeconomic', severity: 'low', explanation: 'Socioeconomic background proxies can signal lower socioeconomic origin to biased models.' },
  ],
  counterfactual: { legacy_ats_score:54, fairai_score:82, score_delta:28, primary_bias_factor:'Career gap (paternity leave) combined with non-Tier-1 university triggered automatic downgrade' },
  feature_attributions: [
    { factor: 'Distributed task queue (50k jobs/day on AWS ECS)', delta: 14, reasoning: 'Large-scale distributed systems experience is a top signal for senior engineering roles' },
    { factor: 'Open source library maintainer (1.2k stars)', delta: 10, reasoning: 'Maintaining a popular OSS project demonstrates community trust and code quality' },
    { factor: '63% API response time reduction', delta: 8, reasoning: 'Quantified performance optimization shows measurable production impact' },
    { factor: 'Multi-tenant PostgreSQL schema (10k+ users)', delta: 6, reasoning: 'Production database design with row-level security shows infrastructure thinking' },
    { factor: 'Real-time collaborative editor (500+ concurrent)', delta: 5, reasoning: 'Complex WebSocket frontend demonstrates advanced full-stack capability' },
    { factor: 'Declarative-only Docker/K8s skills', delta: -4, reasoning: 'Container orchestration listed without deployment evidence' },
    { factor: 'No cloud certification (AWS/GCP)', delta: -3, reasoning: 'Lack of formal certification is a minor gap for cloud-heavy roles' },
    { factor: 'Limited mobile development experience', delta: -5, reasoning: 'No evidence of mobile development narrows cross-platform versatility' },
  ],
  legacy_ats_verdict: 'Auto-Rejected',
  recommendation: 'Advance to Technical Interview',
};

export const DEMO_CF_RESULT = {
  baseline_score: 82,
  bias_stability_score: 61,
  interpretation: 'moderate_bias',
  measured: true,
  summary: 'Measured bias stability score: 61/100. University prestige change: +9 pts, gap removal: +6 pts, name swap: +2 pts. Score variance across demographic changes indicates bias sensitivity — FairAI blind evaluation protected this candidate.',
  variants: [
    { label: 'University → MIT (measured)', simulated_score: 91, delta: +9, reasoning: 'Re-scoring with MIT substituted raised score +9 — confirming institution prestige bias.', measured: true },
    { label: 'Career gap removed (measured)', simulated_score: 88, delta: +6, reasoning: 'Removing gap language raised score +6 — confirming employment continuity bias.', measured: true },
    { label: 'Name → Alex Johnson (measured)', simulated_score: 84, delta: +2, reasoning: 'Name neutralization raised score +2 — mild but statistically significant.', measured: true },
    { label: 'All combined — intersectional (measured)', simulated_score: 96, delta: +14, reasoning: 'Applying ALL demographic changes simultaneously yielded +14 pts.', measured: true },
  ],
  intersectional: {
    combined_delta: 14, sum_of_individual_deltas: 17, amplification_detected: false, amplification_factor: 0.82,
    explanation: 'Combined demographic mutation yielded +14 pts vs sum of individual mutations +17 pts. No intersectional amplification.',
  },
  fairness_metrics: {
    overall_grade: 'C', passing_count: 2, total_count: 4,
    metrics: [
      { id: 'disparate_impact_ratio', label: 'Disparate Impact Ratio', regulation: 'EEOC 4/5ths Rule', value: 0.90, threshold: 0.80, passes: true, direction: 'gte', description: 'Ratio of lowest to highest score across demographic variants.', display: '0.90' },
      { id: 'score_variance', label: 'Score Stability (σ)', regulation: 'Statistical Reliability', value: 6.24, threshold: 5.0, passes: false, direction: 'lte', description: 'Standard deviation of scores across demographic mutations.', display: '6.24' },
      { id: 'bias_amplification', label: 'Bias Amplification Index', regulation: 'EU AI Act Art. 9', value: 0.110, threshold: 0.15, passes: true, direction: 'lte', description: 'Maximum score deviation as a proportion of baseline score.', display: '0.110' },
      { id: 'max_score_deviation', label: 'Max Score Deviation', regulation: 'NYC Local Law 144', value: 9, threshold: 5, passes: false, direction: 'lte', description: 'Largest absolute score change from any single demographic mutation.', display: '9' },
    ],
  },
};

export const DEMO_MULTIMODEL = {
  model_results: [
    { model_id:'llama-3.3-70b-versatile', model_label:'Llama 3.3 70B', original_score:82, institution_score:91, institution_delta:9, gap_score:88, gap_delta:6, name_score:84, name_delta:2, max_delta:9, reason:'Strong distributed systems experience.' },
    { model_id:'gemma2-9b-it', model_label:'Gemma 2 9B', original_score:78, institution_score:90, institution_delta:12, gap_score:86, gap_delta:8, name_score:82, name_delta:4, max_delta:12, reason:'Solid engineering profile with OSS contributions.' },
    { model_id:'mixtral-8x7b-32768', model_label:'Mixtral 8x7B', original_score:80, institution_score:87, institution_delta:7, gap_score:85, gap_delta:5, name_score:81, name_delta:1, max_delta:7, reason:'Experienced backend engineer.' },
  ],
  cross_model_variance: 2.0, avg_institution_bias: 9.3, systemic_bias_detected: true,
  summary: 'Cross-model score variance: σ=2.0. Average institution prestige bias: +9.3 pts. All models exhibit institution bias — confirming this is a SYSTEMIC LLM problem.',
};

export const DEMO_JD_RESULT = {
  overall_bias_score: 48, bias_level: 'Moderately Biased',
  summary: 'This job description contains masculine-coded language and culture-fit framing that research shows reduces applications from women and underrepresented candidates by up to 30%.',
  flagged_phrases: [
    { phrase: 'rockstar engineer', bias_type: 'masculine_coded', severity: 'high', explanation: 'Masculine-coded superlatives statistically deter women from applying.', neutral_alternative: 'skilled engineer' },
    { phrase: 'culture fit', bias_type: 'culture_fit', severity: 'high', explanation: '"Culture fit" is a documented proxy for demographic homogeneity.', neutral_alternative: 'values alignment' },
    { phrase: 'competitive environment', bias_type: 'masculine_coded', severity: 'medium', explanation: 'Competitive framing deters candidates prioritizing psychological safety.', neutral_alternative: 'collaborative, results-driven environment' },
    { phrase: 'move fast', bias_type: 'masculine_coded', severity: 'low', explanation: 'Speed-emphasis signals may discourage caregivers.', neutral_alternative: 'iterate and ship regularly' },
  ],
  inclusive_elements: ['Equal opportunity employer statement', 'Flexible working mentioned'],
  rewrite_suggestions: [
    'Replace "rockstar" with "skilled" or "experienced"',
    'Replace "culture fit" with specific values and working principles',
    'Add explicit mention of parental leave and caregiver accommodation',
  ],
};

export const DEMO_PROOF_RESULT = {
  overall_proof_score: 84, proof_level: 'Strong',
  summary: 'Candidate demonstrates strong verifiable work evidence. 12 public GitHub repos with 163 combined stars, 250 LeetCode problems solved, and active open-source maintenance.',
  key_signals: ['12 public repos, 163 combined stars', '250 LeetCode problems solved including 45 Hard', 'Global LeetCode rank top 8%', 'TypeScript + Python repos — full-stack confirmed'],
  platform_data: [
    { platform: 'github', status: 'fetched', url: 'https://github.com/candidate', username: 'candidate', public_repos: 12, followers: 89, top_repos: [{name: 'react-state-lib', stars: 120, lang: 'TypeScript'}, {name: 'ml-pipeline', stars: 43, lang: 'Python'}], signals: ['12 public repositories', '89 followers', 'Top repo: react-state-lib (120 ⭐, TypeScript)'] },
    { platform: 'leetcode', status: 'fetched', url: 'https://leetcode.com/candidate', username: 'candidate', problems_solved: 250, easy: 90, medium: 115, hard: 45, ranking: 45000, signals: ['250 problems solved total', '90 Easy · 115 Medium · 45 Hard', 'Global rank: 45,000 (top 8%)'] },
    { platform: 'linkedin', status: 'detected', url: 'https://linkedin.com/in/candidate', label: 'LinkedIn Profile', signals: ['LinkedIn profile detected — professional network presence confirmed'] },
  ],
  platform_assessments: [
    { platform: 'github', assessment: 'Active contributor with production-quality repos', strength: 'strong' },
    { platform: 'leetcode', assessment: 'Top 8% globally with 45 Hard problems', strength: 'strong' },
    { platform: 'linkedin', assessment: 'Profile detected — professional presence confirmed', strength: 'moderate' },
  ],
  bias_blind_verdict: 'Online work evidence strongly validates technical capability — fully independent of demographics.',
  ats_override_recommendation: 'Strong',
};

// ─── LLM Comparison Demo ──────────────────────────────────────
export const DEMO_COMPARISON = {
  fairai_advantage_avg: 11,
  cross_model_variance: 4.2,
  systemic_bias_detected: true,
  fairai_bias_reduction: 73,
  summary: 'FairAI scored +11 pts higher on average than mainstream LLMs and exhibited near-zero bias amplification across all 3 demographic mutations. Generic LLMs show consistent institution-prestige bias (+9–12 pts), confirming the bias is systemic — not model-specific. FairAI\'s fine-tuning for blind evaluation demonstrably reduces unfair score variance.',
  insight: 'Every mainstream LLM raised its score when the university was swapped to MIT, proving institution-prestige bias is baked into their training corpora. FairAI\'s fine-tuning on de-identified resumes breaks this pattern — its max demographic delta is only 2 pts vs 7–12 pts for generic models.',
  models: [
    {
      model_id: 'bot4-phi35-resume-evaluator',
      label: 'FairAI (Bot 4 — Fine-tuned Phi-3.5)',
      provider: 'Your Model · HuggingFace / Colab',
      is_own_model: true,
      score: 82,
      recommendation: 'Advance to Technical Interview',
      max_delta: 2,
      radar: { technical_depth: 88, problem_solving: 85, impact_evidence: 78, domain_knowledge: 82, project_complexity: 90, communication_clarity: 74 },
      bias_deltas: [
        { key: 'institution_delta', label: 'Inst.', delta: 1 },
        { key: 'gap_delta',         label: 'Gap',  delta: 2 },
        { key: 'name_delta',        label: 'Name', delta: 0 },
      ],
      reasoning: 'Strong distributed systems experience with measurable production impact. Fine-tuned to evaluate skills contextually, ignoring institutional markers.',
    },
    {
      model_id: 'llama-3.3-70b-versatile',
      label: 'Llama 3.3 70B',
      provider: 'Groq Cloud',
      is_own_model: false,
      score: 71,
      recommendation: 'Schedule Screening Call',
      max_delta: 9,
      radar: { technical_depth: 74, problem_solving: 70, impact_evidence: 65, domain_knowledge: 68, project_complexity: 76, communication_clarity: 62 },
      bias_deltas: [
        { key: 'institution_delta', label: 'Inst.', delta: 9 },
        { key: 'gap_delta',         label: 'Gap',  delta: 6 },
        { key: 'name_delta',        label: 'Name', delta: 2 },
      ],
      reasoning: 'Solid engineering profile with strong OSS contributions, but career gap and non-Tier-1 university lowered initial score.',
    },
    {
      model_id: 'gemma2-9b-it',
      label: 'Gemma 2 9B',
      provider: 'Groq Cloud',
      is_own_model: false,
      score: 69,
      recommendation: 'Request Portfolio Review',
      max_delta: 12,
      radar: { technical_depth: 71, problem_solving: 66, impact_evidence: 60, domain_knowledge: 63, project_complexity: 73, communication_clarity: 58 },
      bias_deltas: [
        { key: 'institution_delta', label: 'Inst.', delta: 12 },
        { key: 'gap_delta',         label: 'Gap',  delta: 8 },
        { key: 'name_delta',        label: 'Name', delta: 4 },
      ],
      reasoning: 'Reasonable technical depth but penalised by employment gap and state university. High institution-prestige bias detected.',
    },
    {
      model_id: 'mixtral-8x7b-32768',
      label: 'Mixtral 8x7B',
      provider: 'Groq Cloud',
      is_own_model: false,
      score: 72,
      recommendation: 'Schedule Screening Call',
      max_delta: 7,
      radar: { technical_depth: 75, problem_solving: 68, impact_evidence: 66, domain_knowledge: 70, project_complexity: 74, communication_clarity: 60 },
      bias_deltas: [
        { key: 'institution_delta', label: 'Inst.', delta: 7 },
        { key: 'gap_delta',         label: 'Gap',  delta: 5 },
        { key: 'name_delta',        label: 'Name', delta: 1 },
      ],
      reasoning: 'Experienced backend engineer with good technical breadth. Score suppressed by non-continuous employment history.',
    },
  ],
};
