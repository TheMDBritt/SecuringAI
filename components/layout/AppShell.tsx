'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { TrademarkNotice } from './TrademarkNotice';
import { loadSettings, applySettings } from '@/lib/settings-store';

/**
 * Enterprise application shell: persistent sidebar rail + sticky top bar,
 * wrapping every route. Close the mobile drawer automatically on navigation.
 */
/**
 * Routes that fill the viewport and manage their own internal scrolling.
 * Anything appended after <main> on these would be pushed off-screen and would
 * shrink the scroll container, so they are excluded from the shell footer.
 */
const APP_ROUTES = ['/dojo', '/playbook'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isAppRoute = APP_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Apply persisted user preferences (e.g. reduce motion) on first load.
  useEffect(() => {
    applySettings(loadSettings());
  }, []);

  // Keep this browser level with every other one the account is signed in on.
  //
  // Not a one-shot pull on load: that would carry other devices' work in but
  // leave work done here stranded until the app was next opened on this same
  // machine. startAutoSync also pushes, on a debounce and when the tab is left.
  //
  // Silent by design. Sync is an optional convenience, so a failure here must
  // not interrupt anyone: syncNow resolves with an error state rather than
  // throwing, the local stores are never touched on failure, and the Settings
  // panel is where the state is actually reported. Signed out or unconfigured
  // it returns immediately without a request.
  useEffect(() => {
    let stop: (() => void) | null = null;
    let live = true;
    import('@/lib/sync-auto')
      .then((m) => {
        if (live) stop = m.startAutoSync();
      })
      .catch(() => null);
    return () => {
      live = false;
      stop?.();
    };
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <div className="min-h-screen">
      {/* Keyboard users land here first and can jump past the nav. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-navy-950"
      >
        Skip to main content
      </a>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-16">
        <TopBar onMenu={() => setMobileOpen(true)} />
        {/* Keyed on the path so the entrance replays on every navigation.
            usePathname() excludes the query string, which is what makes this
            safe: /playbook?section=quiz changing tabs must not remount the
            section and throw away its state.

            App routes fade without the rise. They own the full viewport and
            scroll internally, so translating them adds a transient 8px of
            document overflow and a scrollbar flicker. */}
        <main
          key={pathname}
          id="main-content"
          tabIndex={-1}
          className={[
            'flex flex-1 flex-col',
            isAppRoute ? 'animate-fade-in-fast' : 'animate-page-in',
          ].join(' ')}
        >
          {children}
        </main>
        {/* App routes own the full viewport height and scroll internally, so a
            block appended after <main> steals space from their scroll
            container. Those routes carry the notice in their own footer chrome
            instead; document-style routes get it here. */}
        {!isAppRoute && <TrademarkNotice />}
      </div>
    </div>
  );
}
