import type { AttackType, DojoId, EvaluationResult, Scenario } from '@/types';

interface ScoringPaneProps {
  scenario: Scenario | null;
  dojoId: DojoId;
  dojoLabel: string;
  evaluations: EvaluationResult[];
  /** Cumulative session score (0–100). Decreases with each successful attack. */
  sessionScore: number;
}

// ─── Verdict badge ────────────────────────────────────────────────────────────

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
  rag_injection:    'RAG Injection',
  unknown:          'Unknown',
};

// ─── Framework mappings ───────────────────────────────────────────────────────
// Static per-attack-type mappings: OWASP LLM Top 10, MITRE ATLAS, NIST AI RMF.

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

/** Maps a 0-100 score to a risk level (mirrors evaluator.ts mapScore). */
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

function EvalCard({ eval: e }: { eval: EvaluationResult }) {
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

      {/* Score bar — omitted for benign turns to avoid implying a score reset */}
      {e.attackType !== 'benign' && (
        <ScoreBar score={e.score} riskLevel={e.riskLevel} />
      )}

      {/* Sensitive data exposed — Dojo 1 attack success only */}
      {e.attackSucceeded && e.leakedDataCategory && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500">Sensitive data exposed:</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/10 text-red-300 font-mono">
            {e.leakedDataCategory}
          </span>
        </div>
      )}

      {/* Attack Chain — shown whenever a Dojo 1 attack succeeded */}
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

      {/* Defense Gaps (only when present) */}
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

      {/* Mitigations (only when present) */}
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

// ─── Main export ──────────────────────────────────────────────────────────────

export function ScoringPane({ scenario, dojoId, evaluations, sessionScore }: ScoringPaneProps) {
  const hasScenario = scenario !== null;
  const latest = evaluations[0] ?? null;
  const history = evaluations.slice(1);
  const sessionRisk = scoreToRisk(sessionScore);

  return (
    <div className="flex h-full">
      {/* Score panel */}
      <div className="w-72 shrink-0 border-r border-slate-700 p-3 flex flex-col gap-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Evaluation
        </p>

        {!hasScenario ? (
          <p className="text-xs text-slate-600 italic">No active scenario.</p>
        ) : (
          <>
            {/* Big score — shows cumulative session score, not per-turn score */}
            <div className="flex items-end gap-2">
              <span
                className={[
                  'text-3xl font-bold font-mono',
                  RISK_STYLE[sessionRisk],
                ].join(' ')}
              >
                {sessionScore}
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

            {/* Score bar — reflects session score */}
            <ScoreBar score={sessionScore} riskLevel={sessionRisk} />

            {/* Attack type + risk (per-turn, only when an evaluation exists) */}
            {latest && (
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">
                  {ATTACK_TYPE_LABEL[latest.attackType]}
                </span>
                <span className={['text-[10px] font-mono font-semibold', RISK_STYLE[latest.riskLevel]].join(' ')}>
                  {latest.riskLevel} risk
                </span>
              </div>
            )}

            {/* OWASP tag from evaluator */}
            {latest && latest.owaspCategory !== 'N/A' && (
              <span
                title={latest.owaspCategory}
                className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 bg-slate-800 text-slate-400 font-mono w-fit"
              >
                {latest.owaspCategory.split('–')[0].trim()}
              </span>
            )}

            {/* Scenario OWASP tags */}
            {scenario.owaspTags.length > 0 && (
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
              <p className="text-xs text-slate-600 italic">Send a message to see the evaluation.</p>
            )}
          </>
        )}
      </div>

      {/* Detail + history panel */}
      <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Evaluation Detail
        </p>

        {!hasScenario ? (
          <p className="text-xs text-slate-600 italic">
            Run a scenario to see the attack classification, defensive analysis, and mitigations.
          </p>
        ) : !latest ? (
          <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5">
            <p className="text-xs text-slate-500 font-mono mb-1">Waiting for interaction</p>
            <p className="text-xs text-slate-400 italic">
              Evaluation appears after your first message. The evaluator will classify the attack type,
              explain what happened, and provide a defensive takeaway with OWASP mapping.
            </p>
          </div>
        ) : (
          <>
            <EvalCard eval={latest} />

            {history.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
                  Previous evaluations
                </p>
                {history.map((e, i) => (
                  <div key={i} className="opacity-60 hover:opacity-90 transition-opacity">
                    <EvalCard eval={e} />
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
