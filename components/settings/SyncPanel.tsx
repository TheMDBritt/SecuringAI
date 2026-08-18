'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, SectionHeading } from '@/components/ui';
import {
  syncConfigured,
  consumeAuthRedirect,
  requestMagicLink,
  signInWithPassword,
  setPassword,
  loadSession,
} from '@/lib/sync-client';
import { currentState, signOutAndForget, storeSession, syncNow, type SyncState } from '@/lib/sync';

/**
 * Optional sign-in that mirrors study progress across devices.
 *
 * Everything about the app works signed out, so this panel is additive: it
 * never gates the Dojo or the quiz, and when sync is not configured at all it
 * renders nothing rather than advertising a feature the deployment cannot
 * deliver.
 *
 * Hidden behind ?sync=1 because sign-up is closed to a single address. A
 * sign-in form every visitor can see but nobody can use is an invitation to
 * try, and it would contradict the "no sign-up" promise made on the landing
 * page and in the privacy notice. This is obscurity, not access control: the
 * real gate is the database trigger that refuses any address outside the
 * allowlist, so finding this URL gets a stranger a form and nothing else.
 *
 * Read from window.location rather than useSearchParams so this route can stay
 * statically rendered without a Suspense boundary.
 */
const REVEAL_PARAM = 'sync';
export function SyncPanel() {
  const [state, setState] = useState<SyncState>({ status: 'off' });
  const [email, setEmail] = useState('');
  const [password, setPasswordValue] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  // Changing the password is rare and needs its own field, so it stays folded
  // away rather than adding a third input to the common case.
  const [changing, setChanging] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changed, setChanged] = useState(false);
  const ran = useRef(false);

  // On mount: finish a magic-link redirect if we came back from one, then sync.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const wanted = new URLSearchParams(window.location.search).get(REVEAL_PARAM) === '1';
    if (!wanted) return;
    setRevealed(true);

    if (!syncConfigured()) { setState({ status: 'off' }); return; }

    const fromLink = consumeAuthRedirect();
    if (fromLink) storeSession(fromLink);

    setState(currentState());
    void syncNow().then(setState);
  }, []);

  // Password sign-in: the everyday path, because it costs no email and so is
  // not subject to the mailer's hourly limit on any device.
  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSending(true);
    try {
      await signInWithPassword(email.trim(), password);
      setPasswordValue('');
      setState(await syncNow());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setSending(false);
    }
  }, [email, password]);

  const handleSend = useCallback(async () => {
    setFormError(null);
    setSending(true);
    try {
      // The redirect has to carry the reveal param, or the link would land on a
      // Settings page with no panel mounted to finish the token exchange.
      await requestMagicLink(email.trim(), `${window.location.origin}/settings?${REVEAL_PARAM}=1`);
      setSent(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send the link.');
    } finally {
      setSending(false);
    }
  }, [email]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setChanged(false);
    setSending(true);
    try {
      const session = loadSession();
      if (!session) throw new Error('Sign in again before changing the password.');
      await setPassword(session, newPassword);
      setNewPassword('');
      setChanging(false);
      setChanged(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not change the password.');
    } finally {
      setSending(false);
    }
  }, [newPassword]);

  const handleSync = useCallback(async () => {
    setState((s) => ('email' in s ? { status: 'syncing', email: s.email } : s));
    setState(await syncNow());
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOutAndForget();
    setState({ status: 'signed-out' });
    setSent(false);
  }, []);

  // Not asked for, or nothing configured on this deployment: render nothing
  // rather than offering a control that cannot work.
  if (!revealed || state.status === 'off') return null;

  const signedIn = state.status === 'ok' || state.status === 'syncing' || state.status === 'error';

  return (
    <Card className="mt-4 p-5 sm:p-6">
      <SectionHeading
        eyebrow="Sync"
        title="Progress across devices"
        description="Optional, and private to the account holder. Signed out, everything stays in this browser exactly as before."
      />
      <div className="mt-4">
      {!signedIn ? (
        sent ? (
          <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5">
            <p className="text-xs font-medium text-emerald-300">Check your email.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Open the link on this device and you will land back here signed in. The link works
              once and expires shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignIn}>
            <div className="flex flex-wrap items-end gap-2.5">
              <div className="min-w-[14rem] flex-1">
                <label htmlFor="sync-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Email address
                </label>
                <input
                  id="sync-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none"
                />
              </div>
              <div className="min-w-[12rem] flex-1">
                <label htmlFor="sync-password" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Password
                </label>
                <input
                  id="sync-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-100 focus:border-brand-500/50 focus:outline-none"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                type="submit"
                loading={sending}
                disabled={!email.trim() || !password}
              >
                {sending ? 'Signing in…' : 'Sign in'}
              </Button>
            </div>
            {/* Kept as a fallback rather than the default: it costs one of the
                mailer's two-per-hour allowance, so adding two devices in an
                evening locks the account holder out of their own sign-in. */}
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !email.trim()}
              className="mt-2.5 rounded text-xs text-slate-400 underline underline-offset-2 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:opacity-50"
            >
              Forgotten it? Email me a sign-in link instead
            </button>
          </form>
        )
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised/40 px-3 py-1.5">
            <span
              className={[
                'h-2 w-2 rounded-full',
                state.status === 'ok' ? 'bg-emerald-400' : state.status === 'error' ? 'bg-red-400' : 'bg-amber-400',
              ].join(' ')}
              aria-hidden="true"
            />
            <span className="text-xs text-slate-300">{state.email || 'Signed in'}</span>
          </span>
          <Button variant="secondary" size="md" onClick={handleSync} loading={state.status === 'syncing'}>
            {state.status === 'syncing' ? 'Syncing…' : 'Sync now'}
          </Button>
          <Button variant="ghost" size="md" onClick={() => setChanging((v) => !v)}>
            {changing ? 'Cancel' : 'Set password'}
          </Button>
          <Button variant="ghost" size="md" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      )}

      {signedIn && changing && (
        <form onSubmit={handleChangePassword} className="mt-3 flex flex-wrap items-end gap-2.5">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="sync-new-password" className="mb-1.5 block text-xs font-medium text-slate-400">
              New password
            </label>
            <input
              id="sync-new-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-slate-100 focus:border-brand-500/50 focus:outline-none"
            />
          </div>
          <Button variant="primary" size="md" type="submit" loading={sending} disabled={newPassword.length < 6}>
            {sending ? 'Saving…' : 'Save password'}
          </Button>
        </form>
      )}

      <div role="status" aria-live="polite" className="mt-3 min-h-[1.25rem]">
        {formError && <span className="text-xs font-medium text-red-300">{formError}</span>}
        {changed && (
          <span className="text-xs text-emerald-300">
            Password saved. Use it to sign in on any other device.
          </span>
        )}
        {state.status === 'ok' && (
          <span className="text-xs text-emerald-300">
            Synced. This device and your others now hold the same history.
          </span>
        )}
        {state.status === 'error' && (
          <span className="text-xs text-red-300">
            {state.message} Your progress on this device is untouched.
          </span>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Signing in keeps a copy of your quiz sessions and Dojo attempts so the same history shows up
        on every device you use. Merging is additive: work done on two devices while offline is
        combined rather than one replacing the other. Display preferences stay per device. Signing
        out leaves this browser&rsquo;s copy exactly as it is. Sign in once per browser and it stays
        signed in; after that syncing is automatic in both directions.
      </p>
      </div>
    </Card>
  );
}
