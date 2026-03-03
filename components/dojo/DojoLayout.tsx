interface DojoLayoutProps {
  scenarioPicker: React.ReactNode;
  chatConsole: React.ReactNode;
  controlPanel: React.ReactNode;
  scoringPane: React.ReactNode;
}

export function DojoLayout({
  scenarioPicker,
  chatConsole,
  controlPanel,
  scoringPane,
}: DojoLayoutProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* 3-column main area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left — Scenario Picker */}
        <aside className="w-72 shrink-0 border-r border-slate-700 overflow-y-auto bg-slate-900">
          {scenarioPicker}
        </aside>

        {/* Center — Chat Console */}
        <section className="flex-1 min-w-0 flex flex-col border-r border-slate-700 bg-slate-950">
          {chatConsole}
        </section>

        {/* Right — Control Panel */}
        <aside className="w-80 shrink-0 overflow-y-auto bg-slate-900">
          {controlPanel}
        </aside>
      </div>

      {/* Bottom — Scoring + Explanation */}
      <div className="h-48 shrink-0 border-t border-slate-700 bg-slate-900 overflow-y-auto">
        {scoringPane}
      </div>
    </div>
  );
}
