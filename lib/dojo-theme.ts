/**
 * Accent tokens for the dojo UI.
 *
 * This module used to hand Dojo 1 red, Dojo 2 cyan and Dojo 3 emerald. Those
 * are the same three colours the scoring pane uses for FAIL, WARN and PASS, so
 * a GRC scenario was rendered in the colour that elsewhere means "you passed"
 * and an attack scenario in the colour that means "you failed". Colour was
 * saying two different things at once, and neither could be trusted.
 *
 * Colour is now reserved for state. One accent marks anything interactive or
 * branded; the dojos are told apart by their labels and their position, which
 * is what actually distinguishes them. The three keys are kept so callers do
 * not need to change, and so a future deliberate per-dojo treatment has a
 * single place to live.
 */

export type AccentName = 'red' | 'cyan' | 'emerald';

export interface AccentTokens {
  border: string;
  text: string;
  bg: string;
}

const BRAND: AccentTokens = {
  border: 'border-cyan-500/30 hover:border-cyan-500/60',
  text:   'text-cyan-300',
  bg:     'bg-cyan-500/10',
};

export const ACCENT: Record<AccentName, AccentTokens> = {
  red: BRAND,
  cyan: BRAND,
  emerald: BRAND,
};

import type { DojoId } from '@/types';
export const ACCENT_FOR_DOJO: Record<DojoId, AccentName> = {
  1: 'cyan',
  2: 'cyan',
  3: 'cyan',
};
