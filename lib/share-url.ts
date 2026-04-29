import { SCENARIOS } from './scenarios';
import {
  DEFAULT_CONTROL_CONFIG,
  DEFAULT_DOJO2_CONFIG,
  type ControlConfig,
  type Dojo2Config,
  type DojoId,
  type Scenario,
} from '@/types';

/**
 * URL-shareable subset of session config — defaults are omitted to keep links
 * short. Big free-form fields (Dojo 3 detection rule, RAG context, tool-forge
 * text) are intentionally excluded; the share use case is "configuration, not
 * full state".
 */

export interface ShareState {
  dojoId: DojoId;
  scenario: Scenario | null;
  controlConfig: ControlConfig;
  dojo2Config: Dojo2Config;
}

const SCENARIOS_BY_ID = new Map(SCENARIOS.map((s) => [s.id, s] as const));

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
 * Best-effort hydration: invalid values silently fall back to defaults and
 * never throw, so a tampered link can't crash the page.
 */
export function decodeShare(input: URLSearchParams | string): Partial<ShareState> {
  const p = typeof input === 'string'
    ? new URLSearchParams(input.startsWith('?') ? input.slice(1) : input)
    : input;

  const out: Partial<ShareState> = {};

  const d = p.get('d');
  if (d === '1' || d === '2' || d === '3') {
    out.dojoId = Number(d) as DojoId;
  }

  const s = p.get('s');
  if (s) {
    const scenario = SCENARIOS_BY_ID.get(s);
    if (scenario) {
      out.scenario = scenario;
      if (!out.dojoId) out.dojoId = scenario.dojoId;
    }
  }

  const cc: ControlConfig = { ...DEFAULT_CONTROL_CONFIG };
  let touchedCC = false;
  const shield = p.get('shield');
  if (shield && isShield(shield)) { cc.injectionShield = shield; touchedCC = true; }
  if (p.has('strict')) { cc.strictPolicy = p.get('strict') === '1'; touchedCC = true; }
  if (p.has('tools'))  { cc.allowTools   = p.get('tools')  === '1'; touchedCC = true; }
  if (p.has('rag'))    { cc.ragEnabled   = p.get('rag')    === '1'; touchedCC = true; }
  if (touchedCC) out.controlConfig = cc;

  const dc: Dojo2Config = { ...DEFAULT_DOJO2_CONFIG };
  let touchedDC = false;
  const persona = p.get('p');
  if (persona && isPersona(persona)) { dc.persona = persona; touchedDC = true; }
  const format = p.get('f');
  if (format && isFormat(format))    { dc.outputFormat = format; touchedDC = true; }
  if (touchedDC) out.dojo2Config = dc;

  return out;
}
