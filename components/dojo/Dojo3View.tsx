'use client';

import type { GRCConfig } from '@/types';

interface Props {
  grcConfig: GRCConfig;
  onGRCConfigChange: (c: GRCConfig) => void;
}

export default function Dojo3View({ grcConfig, onGRCConfigChange }: Props) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-0 bg-slate-950">
      <p className="text-emerald-400 font-mono text-sm">AI GRC — coming soon</p>
    </div>
  );
}
