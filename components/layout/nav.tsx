import type { ReactNode } from 'react';

// Shared navigation model + icon set for the enterprise app shell.

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  /** Match nested routes (e.g. /dojo/x) as active. */
  match?: string;
}

const s = 'h-[18px] w-[18px]';

const IconDashboard = (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const IconDojo = (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 3h6" />
    <path d="M10 3v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V3" />
    <path d="M7.5 14h9" />
  </svg>
);

const IconPlaybook = (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 1-2-2z" />
    <path d="M12 3h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
    <path d="M8 7.5h1M8 11h1" />
  </svg>
);

const IconProgress = (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 3v18h18" />
    <path d="M7 14l3.5-4 3 3L20 7" />
  </svg>
);

const IconSettings = (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z" />
  </svg>
);

const IconHelp = (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.8 2.8-2.8 2.8" />
    <path d="M12 17h.01" />
  </svg>
);

const IconAbout = (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </svg>
);

export const PRIMARY_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { href: '/dojo', label: 'Dojo', icon: IconDojo, match: '/dojo' },
  { href: '/playbook', label: 'Playbook', icon: IconPlaybook, match: '/playbook' },
  { href: '/progress', label: 'Progress', icon: IconProgress },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: IconSettings },
  { href: '/help', label: 'Help', icon: IconHelp },
  { href: '/about', label: 'About', icon: IconAbout },
];

// Brand shield mark, reused in sidebar + topbar.
export function BrandMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="brandg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 27 6.4v8.1c0 6.9-4.6 12.9-11 15-6.4-2.1-11-8.1-11-15V6.4z"
        fill="url(#brandg)"
        fillOpacity="0.16"
        stroke="url(#brandg)"
        strokeWidth="1.6"
      />
      <path
        d="M11.2 15.6 14.6 19l6.3-6.6"
        fill="none"
        stroke="url(#brandg)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
