import type { AttackType, DojoId, EvaluationResult, Scenario } from '@/types';

interface ScoringPaneProps {
  scenario: Scenario | null;
  dojoId: DojoId;
  dojoLabel: string;
  evaluations: EvaluationResult[];
  /** Cumulative session score (0–100). Decreases with each successful attack (Dojo 1 only). */
  sessionScore: number;
}

// ─── Shared style maps ────────────────────────────────────────────────────────

const VERDICT_STYLE = {
  PASS: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
  WARN: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
  FAIL: 'bg-red-500/15 border-red-500/40 text-red-400',
};

const RISK_STYLE = {
  low:      'text-emerald-400',
  medium:   'text-amber-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
};

const SCORE_BAR_COLOR = {
  low:      'bg-emerald-500',
  medium:   'bg-amber-500',
  high:     'bg-orange-500',
  critical: 'bg-red-500',
};

const ATTACK_TYPE_LABEL: Record<string, string> = {
  benign:           'Benign',
  probing:          'Probing',
  prompt_injection: 'Prompt Injection',
  data_exfiltration:'Data Exfiltration',
  policy_bypass:    'Policy Bypass',
  tool_abuse:       'Tool Abuse',
  mixed_attack:     'Mixed Attack',
  rag_injection:    'RAG Injection',
  unknown:          'Unknown',
};

// Dojo 2/3 quality level labels
const QUALITY_LEVEL_LABEL: Record<string, string> = {
  low:      'Strong Analysis',
  medium:   'Adequate Analysis',
  high:     'Weak Analysis',
  critical: 'Incomplete Analysis',
};

// ─── Framework mappings (Dojo 1) ─────────────────────────────────────────────

interface FrameworkMap {
  owasp: string[];
  mitreAtlas: string[];
  nistAiRmf: string[];
}

const FRAMEWORK_MAPPINGS: Record<AttackType, FrameworkMap> = {
  prompt_injection: {
    owasp:      ['LLM01 – Prompt Injection'],
    mitreAtlas: ['AML.T0051 – LLM Prompt Injection'],
    nistAiRmf:  ['Measure', 'Manage'],
  },
  data_exfiltration: {
    owasp:      ['LLM06 – Sensitive Information Disclosure'],
    mitreAtlas: ['AML.T0056 – LLM Information Disclosure'],
    nistAiRmf:  ['Measure', 'Govern'],
  },
  policy_bypass: {
    owasp:      ['LLM01 – Prompt Injection', 'LLM02 – Insecure Output Handling'],
    mitreAtlas: ['AML.T0051 – LLM Prompt Injection', 'AML.T0054 – LLM Jailbreak'],
    nistAiRmf:  ['Manage'],
  },
  tool_abuse: {
    owasp:      ['LLM07 – Insecure Plugin Design', 'LLM08 – Excessive Agency'],
    mitreAtlas: ['AML.T0057 – Exploitation of ML-Enabled Products'],
    nistAiRmf:  ['Manage', 'Measure'],
  },
  mixed_attack: {
    owasp:      ['LLM01 – Prompt Injection', 'LLM06 – Sensitive Information Disclosure'],
    mitreAtlas: ['AML.T0051 – LLM Prompt Injection', 'AML.T0056 – LLM Information Disclosure'],
    nistAiRmf:  ['Measure', 'Manage'],
  },
  rag_injection: {
    owasp:      ['LLM01 – Prompt Injection (Indirect)', 'LLM03 – Training Data Poisoning'],
    mitreAtlas: ['AML.T0051 – LLM Prompt Injection', 'AML.T0053 – Poisoning of ML Data'],
    nistAiRmf:  ['Map', 'Measure'],
  },
  probing: {
    owasp:      ['LLM06 – Sensitive Information Disclosure'],
    mitreAtlas: ['AML.T0056 – LLM Information Disclosure'],
    nistAiRmf:  ['Measure'],
  },
  benign:  { owasp: [], mitreAtlas: [], nistAiRmf: [] },
  unknown: { owasp: [], mitreAtlas: [], nistAiRmf: [] },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreToRisk(score: number): EvaluationResult['riskLevel'] {
  if (score >= 90) return 'low';
  if (score >= 70) return 'medium';
  if (score >= 40) return 'high';
  return 'critical';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ score, riskLevel }: { score: number; riskLevel: EvaluationResult['riskLevel'] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-700">
        <div
          className={['h-1.5 rounded-full transition-all', SCORE_BAR_COLOR[riskLevel]].join(' ')}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-8 text-right">{score}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
      {children}
    </p>
  );
}

// ─── Dojo 1 EvalCard ──────────────────────────────────────────────────────────

function Dojo1EvalCard({ eval: e }: { eval: EvaluationResult }) {
  return (
    <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5 flex flex-col gap-3">
      {/* Top row: verdict + score + risk + attack type */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={['text-[11px] font-bold px-2 py-0.5 rounded border font-mono', VERDICT_STYLE[e.verdict]].join(' ')}>
          {e.verdict}
        </span>
        <span className={['text-[11px] font-mono', RISK_STYLE[e.riskLevel]].join(' ')}>
          {e.riskLevel.toUpperCase()}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">
          {ATTACK_TYPE_LABEL[e.attackType] ?? e.attackType}
        </span>
        {e.attackSucceeded && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 font-mono">
            attack succeeded
          </span>
        )}
      </div>

      {/* Score bar — omitted for benign turns */}
      {e.attackType !== 'benign' && (
        <ScoreBar score={e.score} riskLevel={e.riskLevel} />
      )}

      {/* Sensitive data exposed */}
      {e.attackSucceeded && e.leakedDataCategory && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500">Sensitive data exposed:</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/10 text-red-300 font-mono">
            {e.leakedDataCategory}
          </span>
        </div>
      )}

      {/* Attack Chain */}
      {e.attackChain && e.attackChain.chain.length > 0 && (
        <div>
          <SectionLabel>Attack Chain</SectionLabel>
          <p className="text-[11px] font-mono text-slate-200 leading-relaxed">
            {e.attackChain.chain.map((t) => ATTACK_TYPE_LABEL[t] ?? t).join(' → ')}
          </p>
          {e.attackChain.chainPenalty > 0 && (
            <p className="text-[10px] font-mono text-red-400 mt-0.5">
              Chain penalty: -{e.attackChain.chainPenalty}
            </p>
          )}
        </div>
      )}

      {/* WHAT HAPPENED */}
      <div>
        <SectionLabel>What Happened</SectionLabel>
        <p className="text-[11px] text-slate-200 leading-relaxed">{e.whatHappened}</p>
      </div>

      {/* SIGNALS */}
      {e.signals.length > 0 && (
        <div>
          <SectionLabel>Signals</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {e.signals.map((s, i) => (
              <li key={i} className="text-[10px] text-slate-400 font-mono flex gap-1.5">
                <span className="text-cyan-600 shrink-0">▸</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Defense Gaps */}
      {e.defensiveFailures.length > 0 && (
        <div>
          <SectionLabel>Defense Gaps</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {e.defensiveFailures.map((f, i) => (
              <li key={i} className="text-[10px] text-red-300/80 flex gap-1.5">
                <span className="text-red-500 shrink-0">✗</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DEFENSIVE TAKEAWAY */}
      <div className="border-t border-slate-700/60 pt-2.5">
        <SectionLabel>Defensive Takeaway</SectionLabel>
        <p className="text-[11px] text-slate-300 leading-relaxed">{e.defensiveTakeaway}</p>
      </div>

      {/* Mitigations */}
      {e.recommendedMitigations.length > 0 && (
        <div>
          <SectionLabel>Mitigations</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {e.recommendedMitigations.map((m, i) => (
              <li key={i} className="text-[10px] text-amber-300/80 flex gap-1.5">
                <span className="text-amber-500 shrink-0">→</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FRAMEWORK MAPPING */}
      {(() => {
        const fm = FRAMEWORK_MAPPINGS[e.attackType];
        if (!fm || (fm.owasp.length === 0 && fm.mitreAtlas.length === 0 && fm.nistAiRmf.length === 0)) {
          return null;
        }
        return (
          <div className="border-t border-slate-700/60 pt-2.5">
            <SectionLabel>Framework Mapping</SectionLabel>
            <div className="flex flex-col gap-2">
              {fm.owasp.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">
                    OWASP LLM Top 10
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {fm.owasp.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border border-red-500/25 bg-red-500/8 text-red-300/80 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {fm.mitreAtlas.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">
                    MITRE ATLAS
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {fm.mitreAtlas.map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border border-orange-500/25 bg-orange-500/8 text-orange-300/80 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {fm.nistAiRmf.length > 0 && (
                <div>
                  <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">
                    NIST AI RMF
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {fm.nistAiRmf.map((fn) => (
                      <span key={fn} className="text-[10px] px-1.5 py-0.5 rounded border border-blue-500/25 bg-blue-500/8 text-blue-300/80 font-mono">
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Dojo 2/3 Quality EvalCard ────────────────────────────────────────────────

function QualityEvalCard({ eval: e }: { eval: EvaluationResult }) {
  const qualityLabel = QUALITY_LEVEL_LABEL[e.riskLevel] ?? 'Analysis';

  return (
    <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5 flex flex-col gap-3">
      {/* Top row: verdict + quality level */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={['text-[11px] font-bold px-2 py-0.5 rounded border font-mono', VERDICT_STYLE[e.verdict]].join(' ')}>
          {e.verdict}
        </span>
        <span className={['text-[11px] font-mono', RISK_STYLE[e.riskLevel]].join(' ')}>
          {qualityLabel.toUpperCase()}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">
          {e.score}% complete
        </span>
      </div>

      {/* Quality score bar */}
      <ScoreBar score={e.score} riskLevel={e.riskLevel} />

      {/* ANALYSIS SUMMARY */}
      <div>
        <SectionLabel>Analysis Summary</SectionLabel>
        <p className="text-[11px] text-slate-200 leading-relaxed">{e.whatHappened}</p>
      </div>

      {/* QUALITY CRITERIA MET */}
      {e.signals.length > 0 && (
        <div>
          <SectionLabel>Quality Criteria Met</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {e.signals.map((s, i) => (
              <li key={i} className="text-[10px] text-emerald-300/80 flex gap-1.5">
                <span className="text-emerald-500 shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MISSING ELEMENTS */}
      {e.defensiveFailures.length > 0 && (
        <div>
          <SectionLabel>Missing Elements</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {e.defensiveFailures.map((f, i) => (
              <li key={i} className="text-[10px] text-amber-300/70 flex gap-1.5">
                <span className="text-amber-500 shrink-0">◯</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* HOW TO IMPROVE */}
      {e.recommendedMitigations.length > 0 && e.recommendedMitigations[0] !== 'Analysis covers all quality criteria for this scenario.' && (
        <div>
          <SectionLabel>How to Improve</SectionLabel>
          <ul className="flex flex-col gap-0.5">
            {e.recommendedMitigations.map((m, i) => (
              <li key={i} className="text-[10px] text-slate-400 flex gap-1.5">
                <span className="text-cyan-600 shrink-0">→</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SECURITYAI+ CONNECTION */}
      <div className="border-t border-slate-700/60 pt-2.5">
        <SectionLabel>SecurityAI+ Connection</SectionLabel>
        <p className="text-[11px] text-slate-300 leading-relaxed">{e.defensiveTakeaway}</p>
      </div>

      {/* SECURITYAI+ TOPICS */}
      {e.securityAITopics && e.securityAITopics.length > 0 && (
        <div className="border-t border-slate-700/60 pt-2.5">
          <SectionLabel>SecurityAI+ Exam Topics</SectionLabel>
          <div className="flex flex-wrap gap-1 mt-1">
            {e.securityAITopics.map((topic) => (
              <span
                key={topic}
                className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/25 bg-cyan-500/8 text-cyan-300/80 font-mono"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ScoringPane({ scenario, dojoId, evaluations, sessionScore }: ScoringPaneProps) {
  const hasScenario  = scenario !== null;
  const latest       = evaluations[0] ?? null;
  const history      = evaluations.slice(1);
  const sessionRisk  = scoreToRisk(sessionScore);
  const isQualityMode = dojoId === 2 || dojoId === 3;

  // For Dojo 2/3 show the latest evaluation score prominently; for Dojo 1 show cumulative session score.
  const displayScore = isQualityMode ? (latest?.score ?? 100) : sessionScore;
  const displayRisk  = isQualityMode ? (latest?.riskLevel ?? 'low') : sessionRisk;

  return (
    <div className="flex h-full">
      {/* Score panel */}
      <div className="w-72 shrink-0 border-r border-slate-700 p-3 flex flex-col gap-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          {isQualityMode ? 'Analysis Quality' : 'Evaluation'}
        </p>

        {!hasScenario ? (
          <p className="text-xs text-slate-600 italic">No active scenario.</p>
        ) : (
          <>
            {/* Big score */}
            <div className="flex items-end gap-2">
              <span
                className={[
                  'text-3xl font-bold font-mono',
                  RISK_STYLE[displayRisk],
                ].join(' ')}
              >
                {displayScore}
              </span>
              <span className="text-sm text-slate-600 mb-0.5">/ 100</span>
              {latest && (
                <span
                  className={[
                    'text-[11px] font-bold px-2 py-0.5 rounded border font-mono ml-1 mb-0.5',
                    VERDICT_STYLE[latest.verdict],
                  ].join(' ')}
                >
                  {latest.verdict}
                </span>
              )}
            </div>

            {/* Score bar */}
            <ScoreBar score={displayScore} riskLevel={displayRisk} />

            {/* Quality label (Dojo 2/3) or attack type (Dojo 1) */}
            {latest && (
              <div className="flex gap-1.5 flex-wrap">
                {isQualityMode ? (
                  <span className={['text-[10px] font-mono font-semibold', RISK_STYLE[latest.riskLevel]].join(' ')}>
                    {QUALITY_LEVEL_LABEL[latest.riskLevel] ?? 'Analysis'}
                  </span>
                ) : (
                  <>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">
                      {ATTACK_TYPE_LABEL[latest.attackType]}
                    </span>
                    <span className={['text-[10px] font-mono font-semibold', RISK_STYLE[latest.riskLevel]].join(' ')}>
                      {latest.riskLevel} risk
                    </span>
                  </>
                )}
              </div>
            )}

            {/* OWASP tag (Dojo 1 only) */}
            {!isQualityMode && latest && latest.owaspCategory !== 'N/A' && (
              <span
                title={latest.owaspCategory}
                className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 bg-slate-800 text-slate-400 font-mono w-fit"
              >
                {latest.owaspCategory.split('–')[0].trim()}
              </span>
            )}

            {/* SecurityAI+ primary topic (Dojo 2/3) */}
            {isQualityMode && latest?.securityAITopics && latest.securityAITopics.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 font-mono w-fit">
                {latest.securityAITopics[0]}
              </span>
            )}

            {/* Scenario OWASP tags (Dojo 1 only) */}
            {!isQualityMode && scenario.owaspTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {scenario.owaspTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-500 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* History count */}
            {latest && history.length > 0 && (
              <p className="text-[10px] text-slate-600 font-mono">
                + {history.length} earlier evaluation{history.length > 1 ? 's' : ''} below
              </p>
            )}

            {/* Prompt if no evaluations yet */}
            {!latest && (
              <p className="text-xs text-slate-600 italic">
                {isQualityMode
                  ? 'Paste logs, alerts, or a security artifact to see the quality evaluation.'
                  : 'Send a message to see the evaluation.'}
              </p>
            )}
          </>
        )}
      </div>

      {/* Detail + history panel */}
      <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          {isQualityMode ? 'Quality Analysis' : 'Evaluation Detail'}
        </p>

        {!hasScenario ? (
          <p className="text-xs text-slate-600 italic">
            {isQualityMode
              ? 'Select a scenario and interact with BlackBeltAI to see how well its analysis covers key security criteria.'
              : 'Run a scenario to see the attack classification, defensive analysis, and mitigations.'}
          </p>
        ) : !latest ? (
          <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5">
            <p className="text-xs text-slate-500 font-mono mb-1">
              {isQualityMode ? 'Waiting for interaction' : 'Waiting for interaction'}
            </p>
            <p className="text-xs text-slate-400 italic">
              {isQualityMode
                ? 'Submit a security artifact (logs, alert, behavior description, or policy question) to BlackBeltAI. The evaluator will score the analysis against scenario quality criteria and show SecurityAI+ exam connections.'
                : 'Evaluation appears after your first message. The evaluator will classify the attack type, explain what happened, and provide a defensive takeaway with OWASP mapping.'}
            </p>
          </div>
        ) : (
          <>
            {isQualityMode ? (
              <QualityEvalCard eval={latest} />
            ) : (
              <Dojo1EvalCard eval={latest} />
            )}

            {history.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                  Previous evaluations
                </p>
                {history.map((e, i) => (
                  <div key={i} className="opacity-60 hover:opacity-90 transition-opacity">
                    {isQualityMode ? (
                      <QualityEvalCard eval={e} />
                    ) : (
                      <Dojo1EvalCard eval={e} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
