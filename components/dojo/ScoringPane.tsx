import type { DojoId, Scenario } from '@/types';

interface ScoringPaneProps {
  scenario: Scenario | null;
  dojoId: DojoId;
  dojoLabel: string;
}

const OWASP_DESCRIPTIONS: Record<string, string> = {
  LLM01: 'Prompt Injection',
  LLM02: 'Insecure Output Handling',
  LLM03: 'Training Data Poisoning',
  LLM04: 'Model Denial of Service',
  LLM05: 'Supply-Chain Vulnerabilities',
  LLM06: 'Sensitive Information Disclosure',
  LLM07: 'Insecure Plugin Design',
  LLM08: 'Excessive Agency',
  LLM09: 'Overreliance',
  LLM10: 'Model Theft',
};

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-700">
        <div
          className={['h-1.5 rounded-full transition-all', color].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-12 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

export function ScoringPane({ scenario, dojoId, dojoLabel }: ScoringPaneProps) {
  const hasScenario = scenario !== null;

  return (
    <div className="flex h-full">
      {/* Score panel */}
      <div className="w-72 shrink-0 border-r border-slate-700 p-3 flex flex-col gap-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Scoring
        </p>

        {!hasScenario ? (
          <p className="text-xs text-slate-600 italic">No active scenario.</p>
        ) : (
          <>
            {/* Big score */}
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold font-mono text-slate-500">—</span>
              <span className="text-sm text-slate-600 mb-0.5">/ 100</span>
            </div>

            {/* Sub-scores */}
            <div className="flex flex-col gap-2">
              {dojoId === 1 && (
                <>
                  <ScoreBar label="Attack" value={0} max={50} color="bg-red-500" />
                  <ScoreBar label="Defense" value={0} max={50} color="bg-cyan-500" />
                </>
              )}
              {dojoId === 2 && (
                <>
                  <ScoreBar label="IOC Precision" value={0} max={34} color="bg-cyan-500" />
                  <ScoreBar label="Rule Quality" value={0} max={33} color="bg-emerald-500" />
                  <ScoreBar label="Report Score" value={0} max={33} color="bg-amber-500" />
                </>
              )}
              {dojoId === 3 && (
                <>
                  <ScoreBar label="Detection" value={0} max={34} color="bg-emerald-500" />
                  <ScoreBar label="Policy Coverage" value={0} max={33} color="bg-cyan-500" />
                  <ScoreBar label="Threat Model" value={0} max={33} color="bg-amber-500" />
                </>
              )}
            </div>

            {/* OWASP tags */}
            {scenario.owaspTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {scenario.owaspTags.map((tag) => (
                  <span
                    key={tag}
                    title={OWASP_DESCRIPTIONS[tag]}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 bg-slate-800 text-slate-400 font-mono cursor-help"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Explanation panel */}
      <div className="flex-1 p-3 overflow-y-auto">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
          Why it worked / failed
        </p>

        {!hasScenario ? (
          <p className="text-xs text-slate-600 italic">
            Run a scenario to see AXIOM-1's explanation of the attack vector, defensive gaps, and remediations.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5">
              <p className="text-xs text-slate-500 font-mono mb-1">Summary</p>
              <p className="text-xs text-slate-400 italic">
                Explanation appears after your first attempt. AXIOM-1 will analyze the attack vector and defensive coverage.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5">
                <p className="text-[10px] font-mono text-emerald-500 mb-1">✓ What Worked</p>
                <p className="text-xs text-slate-500 italic">—</p>
              </div>
              <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5">
                <p className="text-[10px] font-mono text-red-400 mb-1">✗ What Failed</p>
                <p className="text-xs text-slate-500 italic">—</p>
              </div>
            </div>

            <div className="rounded border border-slate-700 bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-mono text-amber-500 mb-1">Remediations</p>
              <p className="text-xs text-slate-500 italic">—</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
