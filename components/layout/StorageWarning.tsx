'use client';

import { useEffect, useState } from 'react';
import { onStorageHealthChange, storageFailing } from '@/lib/storage-health';
import { backupText } from '@/lib/progress-backup';

/**
 * Tells the learner when their work has stopped being saved.
 *
 * Without this the failure is invisible. localStorage refuses writes when the
 * origin's quota is spent, and Safari in private browsing refuses every write
 * outright, so a learner can answer questions for an hour while nothing is
 * recorded and every screen keeps showing the history they had when they
 * arrived. Believing in a record that does not exist is worse than being told
 * the truth, so this sits above the content and does not dismiss on its own.
 *
 * The copy offers the export because that is the one action that actually
 * rescues the situation: the in-memory state is still correct until the tab
 * closes, and the backup can be pasted into another browser afterwards.
 */
export function StorageWarning() {
  const [failing, setFailing] = useState(false);
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    setFailing(storageFailing());
    return onStorageHealthChange(() => setFailing(storageFailing()));
  }, []);

  if (!failing) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(backupText());
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
  };

  return (
    <div
      role="alert"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center sm:px-6"
    >
      <p className="text-xs leading-relaxed text-amber-200">
        <span className="font-medium">This browser has stopped saving your progress.</span>{' '}
        Storage is full, or private browsing is blocking it. Work done from now on will be
        lost when you close the tab.{' '}
        <button
          type="button"
          onClick={handleCopy}
          className="rounded underline underline-offset-2 hover:text-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        >
          Copy a backup
        </button>
        {copied === 'ok' && <span className="ml-2 text-emerald-300">Copied.</span>}
        {copied === 'fail' && (
          <span className="ml-2 text-red-300">Could not copy. Use Settings &rarr; Export.</span>
        )}
      </p>
    </div>
  );
}
