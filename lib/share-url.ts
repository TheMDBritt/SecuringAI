/**
 * Deep-link share URL — encode/decode the dojo, scenario, and the security
 * knobs that meaningfully change behaviour so a learner can paste a link and
 * land in the exact configuration they want to demonstrate.
 *
 * Schema (all params optional):
 *   d      = dojo id           — "1" | "2" | "3"
 *   s      = scenario id       — kebab-case, validated against SCENARIOS
 *   shield = injection shield  — "off" | "basic" | "strict"
 *   strict = strictPolicy      — "1" | "0"
 *   tools  = allowTools        — "1" | "0"
 *   rag    = ragEnabled        — "1" | "0"
 *   p      = Dojo 2 persona    — "analyst" | "ciso" | "ir-lead"
 *   f      = Dojo 2 format     — "markdown" | "json" | "report"
 *
 * Big free-form fields (Dojo 3 detection rule, selected clauses, RAG context,
 * tool forge text) are intentionally NOT shared via URL — they would balloon
 * link length and the share use case is "configuration, not full state".
 */

import { SCENARIOS } from './scenarios';
import {
  DEFAULT_CONTROL_CONFIG,
  DEFAULT_DOJO2_CONFIG,
  type ControlConfig,
  type Dojo2Config,
  type DojoId,
  type Scenario,
} from '@/types';

export interface ShareState {
  dojoId: DojoId;
  scenario: Scenario | null;
  controlConfig: ControlConfig;
  dojo2Config: Dojo2Config;
}

const SCENARIO_IDS = new Set(SCENARIOS.map((s) => s.id));

function bool(v: boolean): '1' | '0' {
  return v ? '1' : '0';
}

function isShield(v: string): v is ControlConfig['injectionShield'] {
  return v === 'off' || v === 'basic' || v === 'strict';
}

function isPersona(v: string): v is Dojo2Config['persona'] {
  return v === 'analyst' || v === 'ciso' || v === 'ir-lead';
}

function isFormat(v: string): v is Dojo2Config['outputFormat'] {
  return v === 'markdown' || v === 'json' || v === 'report';
}

/**
 * Build a URLSearchParams string from current state.
 * Defaults are omitted to keep URLs short and readable.
 */
export function encodeShare(state: ShareState): string {
  const p = new URLSearchParams();
  if (state.dojoId !== 1) p.set('d', String(state.dojoId));
  if (state.scenario) p.set('s', state.scenario.id);

  const cc = state.controlConfig;
  if (cc.injectionShield !== DEFAULT_CONTROL_CONFIG.injectionShield) p.set('shield', cc.injectionShield);
  if (cc.strictPolicy   !== DEFAULT_CONTROL_CONFIG.strictPolicy)   p.set('strict', bool(cc.strictPolicy));
  if (cc.allowTools     !== DEFAULT_CONTROL_CONFIG.allowTools)     p.set('tools',  bool(cc.allowTools));
  if (cc.ragEnabled     !== DEFAULT_CONTROL_CONFIG.ragEnabled)     p.set('rag',    bool(cc.ragEnabled));

  if (state.dojoId === 2) {
    const dc = state.dojo2Config;
    if (dc.persona      !== DEFAULT_DOJO2_CONFIG.persona)      p.set('p', dc.persona);
    if (dc.outputFormat !== DEFAULT_DOJO2_CONFIG.outputFormat) p.set('f', dc.outputFormat);
  }

  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Hydrate state from a URLSearchParams (or a query string). Unknown / invalid
 * values silently fall back to defaults — share links are best-effort and
 * never throw.
 */
export function decodeShare(input: URLSearchParams | string): Partial<ShareState> {
  const p = typeof input === 'string'
    ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
    : input;

  const out: Partial<ShareState> = {};

  // dojo id
  const d = p.get('d');
  if (d === '1' || d === '2' || d === '3') {
    out.dojoId = Number(d) as DojoId;
  }

  // scenario id (validated against the canonical list)
  const s = p.get('s');
  if (s && SCENARIO_IDS.has(s)) {
    const scenario = SCENARIOS.find((sc) => sc.id === s)!;
    out.scenario = scenario;
    // If no dojo was supplied, infer it from the scenario.
    if (!out.dojoId) out.dojoId = scenario.dojoId;
  }

  // control config (start from defaults, override only what was supplied)
  const cc: ControlConfig = { ...DEFAULT_CONTROL_CONFIG };
  let touchedCC = false;
  const shield = p.get('shield');
  if (shield && isShield(shield)) { cc.injectionShield = shield; touchedCC = true; }
  if (p.has('strict')) { cc.strictPolicy = p.get('strict') === '1'; touchedCC = true; }
  if (p.has('tools'))  { cc.allowTools   = p.get('tools')  === '1'; touchedCC = true; }
  if (p.has('rag'))    { cc.ragEnabled   = p.get('rag')    === '1'; touchedCC = true; }
  if (touchedCC) out.controlConfig = cc;

  // dojo 2 config
  const dc: Dojo2Config = { ...DEFAULT_DOJO2_CONFIG };
  let touchedDC = false;
  const persona = p.get('p');
  if (persona && isPersona(persona)) { dc.persona = persona; touchedDC = true; }
  const format = p.get('f');
  if (format && isFormat(format))    { dc.outputFormat = format; touchedDC = true; }
  if (touchedDC) out.dojo2Config = dc;

  return out;
}
