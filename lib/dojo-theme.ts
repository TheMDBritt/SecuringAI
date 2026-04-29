/**
 * Single source of truth for the red/cyan/emerald accent palette used across
 * the dojo UI. red = Dojo 1 (offence), cyan = Dojo 2 (analyst), emerald =
 * Dojo 3 (defence). Every surface that needs an accent imports from here.
 */

export type AccentName = 'red' | 'cyan' | 'emerald';

export interface AccentTokens {
  border: string;
  text: string;
  bg: string;
}

export const ACCENT: Record<AccentName, AccentTokens> = {
  red: {
    border: 'border-red-500/30 hover:border-red-500/60',
    text:   'text-red-400',
    bg:     'bg-red-500/10',
  },
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    text:   'text-cyan-400',
    bg:     'bg-cyan-500/10',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    text:   'text-emerald-400',
    bg:     'bg-emerald-500/10',
  },
};

import type { DojoId } from '@/types';
export const ACCENT_FOR_DOJO: Record<DojoId, AccentName> = {
  1: 'red',
  2: 'cyan',
  3: 'emerald',
};
