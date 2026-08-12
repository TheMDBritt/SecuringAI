'use client';

import { useState, useCallback, useRef } from 'react';

interface DojoLayoutProps {
  scenarioPicker: React.ReactNode;
  chatConsole: React.ReactNode;
  controlPanel: React.ReactNode;
  scoringPane: React.ReactNode;
}

const MIN_SCORE_H = 140;
const MAX_SCORE_H = 520;
const DEFAULT_SCORE_H = 220;

export function DojoLayout({
  scenarioPicker,
  chatConsole,
  controlPanel,
  scoringPane,
}: DojoLayoutProps) {
  const [scoringH, setScoringH] = useState(DEFAULT_SCORE_H);
  const dragRef = useRef<{ startY: number; startH: number } | null>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    dragRef.current = { startY: e.clientY, startH: scoringH };
    e.preventDefault();

    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      const next  = Math.min(MAX_SCORE_H, Math.max(MIN_SCORE_H, dragRef.current.startH + delta));
      setScoringH(next);
    }
    function onUp() {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [scoringH]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* 3-column main area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Scenario Picker */}
        <aside
          className="w-72 shrink-0 border-r border-slate-700 overflow-y-auto bg-slate-900"
          aria-label="Scenario picker"
        >
          {scenarioPicker}
        </aside>

        {/* Center: Chat Console */}
        <section
          className="flex-1 min-w-0 flex flex-col border-r border-slate-700 bg-slate-950"
          aria-label="Chat console"
        >
          {chatConsole}
        </section>

        {/* Right: Control Panel */}
        <aside
          className="w-80 shrink-0 overflow-y-auto bg-slate-900"
          aria-label="Control panel"
        >
          {controlPanel}
        </aside>
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-label="Resize scoring panel"
        aria-orientation="horizontal"
        className="h-[5px] shrink-0 border-t border-slate-700 bg-slate-800/60 hover:bg-slate-700 cursor-row-resize transition-colors duration-150 flex items-center justify-center group"
        onMouseDown={onDragStart}
      >
        <div className="w-10 h-[3px] rounded-full bg-slate-700 group-hover:bg-slate-500 transition-colors duration-150" />
      </div>

      {/* Bottom: Scoring + Explanation */}
      <div
        className="shrink-0 border-t border-slate-700/60 bg-slate-900 overflow-y-auto"
        style={{ height: scoringH }}
        aria-label="Evaluation scoring"
      >
        {scoringPane}
      </div>
    </div>
  );
}
