'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Three-region lab layout.
 *
 * Desktop keeps the original arrangement: scenario picker, chat console and
 * control panel side by side, with a draggable scoring pane below.
 *
 * Below `lg` that arrangement does not fit. Three fixed columns forced a
 * horizontal scroll and the drag handle has no touch equivalent, so on small
 * screens the regions stack and become a tab set instead: one region visible at
 * a time, switched by a control bar. Chat is the default because it is where
 * the work happens.
 */

type Pane = 'scenarios' | 'chat' | 'controls' | 'scoring';

const PANES: { id: Pane; label: string }[] = [
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'chat', label: 'Chat' },
  { id: 'controls', label: 'Controls' },
  { id: 'scoring', label: 'Scoring' },
];

const MIN_SCORING_H = 120;
const MAX_SCORING_H = 520;

export function DojoLayout({
  scenarioPicker,
  chatConsole,
  controlPanel,
  scoringPane,
  hasScenario = false,
}: {
  scenarioPicker: React.ReactNode;
  chatConsole: React.ReactNode;
  controlPanel: React.ReactNode;
  scoringPane: React.ReactNode;
  /** True once a scenario is selected. Drives the mobile landing pane. */
  hasScenario?: boolean;
}) {
  const [scoringH, setScoringH] = useState(220);
  // On a narrow screen only one pane is visible at a time. Landing on Chat with
  // no scenario chosen puts the user on a dead end that reads "Select a scenario
  // to begin" with no scenario in sight, so the picker is the landing pane until
  // one is chosen.
  const [pane, setPane] = useState<Pane>(hasScenario ? 'chat' : 'scenarios');
  const pickedRef = useRef(hasScenario);

  // Advance to Chat the first time a scenario is selected, so picking one on
  // mobile takes the user to the thing they picked.
  useEffect(() => {
    if (hasScenario && !pickedRef.current) {
      pickedRef.current = true;
      setPane('chat');
    }
    if (!hasScenario) pickedRef.current = false;
  }, [hasScenario]);
  const startY = useRef(0);
  const startH = useRef(0);

  const applyHeight = useCallback((next: number) => {
    setScoringH(Math.min(MAX_SCORING_H, Math.max(MIN_SCORING_H, next)));
  }, []);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      startY.current = e.clientY;
      startH.current = scoringH;

      const onMove = (ev: MouseEvent) => applyHeight(startH.current + (startY.current - ev.clientY));
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [scoringH, applyHeight],
  );

  // The separator is a real control, so it answers to arrow keys as well as the
  // mouse. Dragging alone left keyboard users unable to resize at all.
  const onSeparatorKey = useCallback(
    (e: React.KeyboardEvent) => {
      const STEP = e.shiftKey ? 48 : 16;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        applyHeight(scoringH + STEP);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        applyHeight(scoringH - STEP);
      } else if (e.key === 'Home') {
        e.preventDefault();
        applyHeight(MAX_SCORING_H);
      } else if (e.key === 'End') {
        e.preventDefault();
        applyHeight(MIN_SCORING_H);
      }
    },
    [scoringH, applyHeight],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Pane switcher, small screens only. */}
      <div
        className="flex shrink-0 items-center gap-1 border-b border-slate-700 bg-slate-900 px-2 py-1.5 lg:hidden"
        role="tablist"
        aria-label="Dojo panels"
      >
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            onClick={() => setPane(p.id)}
            className={[
              'flex-1 rounded px-2 py-1.5 text-[11px] font-mono transition-colors',
              pane === p.id
                ? 'bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30'
                : 'text-slate-500 hover:text-slate-300',
            ].join(' ')}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={[
            'shrink-0 overflow-y-auto border-slate-700 bg-slate-900',
            'w-full border-r-0 lg:w-72 lg:border-r',
            pane === 'scenarios' ? 'block' : 'hidden lg:block',
          ].join(' ')}
          aria-label="Scenario picker"
        >
          {scenarioPicker}
        </aside>

        <section
          className={[
            'flex min-w-0 flex-1 flex-col border-slate-700 bg-slate-950',
            'lg:border-r',
            pane === 'chat' ? 'flex' : 'hidden lg:flex',
          ].join(' ')}
          aria-label="Chat console"
        >
          {chatConsole}
        </section>

        <aside
          className={[
            'shrink-0 overflow-y-auto bg-slate-900',
            'w-full lg:w-80',
            pane === 'controls' ? 'block' : 'hidden lg:block',
          ].join(' ')}
          aria-label="Control panel"
        >
          {controlPanel}
        </aside>
      </div>

      {/* Resize handle, desktop only. On small screens scoring is a tab. */}
      <div
        role="separator"
        tabIndex={0}
        aria-label="Resize scoring panel"
        aria-orientation="horizontal"
        aria-valuenow={scoringH}
        aria-valuemin={MIN_SCORING_H}
        aria-valuemax={MAX_SCORING_H}
        onMouseDown={onDragStart}
        onKeyDown={onSeparatorKey}
        className="group hidden h-[5px] shrink-0 cursor-row-resize items-center justify-center border-t border-slate-700 bg-slate-800/60 transition-colors duration-150 hover:bg-slate-700 focus-visible:bg-brand-600 lg:flex"
      >
        <div className="h-[3px] w-10 rounded-full bg-slate-700 transition-colors duration-150 group-hover:bg-slate-500" />
      </div>

      <div
        className={[
          'shrink-0 overflow-y-auto border-t border-slate-700/60 bg-slate-900',
          pane === 'scoring' ? 'block flex-1' : 'hidden lg:block',
        ].join(' ')}
        style={{ height: undefined }}
        aria-label="Evaluation scoring"
      >
        {/* Fixed height only applies to the desktop split view. */}
        <div className="lg:h-[var(--scoring-h)]" style={{ ['--scoring-h' as string]: `${scoringH}px` }}>
          {scoringPane}
        </div>
      </div>
    </div>
  );
}
