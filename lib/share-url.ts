import { SCENARIOS } from './scenarios';
import { POLICY_CLAUSES, VENDOR_GAP_AREAS } from './dojo-control-content';
import {
  DEFAULT_CONTROL_CONFIG,
  DEFAULT_DOJO2_CONFIG,
  DEFAULT_DOJO3_CONFIG,
  type ControlConfig,
  type Dojo2Config,
  type Dojo3Config,
  type DojoId,
  type Scenario,
} from '@/types';

/**
 * URL-shareable session config. Defaults are omitted, so a link carries only
 * what was actually changed and stays short.
 *
 * Everything that changes what the lab produces or how it is scored has to be
 * here. Dojo 2 previously encoded persona and output format only — two of its
 * ten settings — and Dojo 3 encoded nothing at all, so opening a shared link
 * ran a different lab from the one that was shared, silently. Free-form text
 * (the Dojo 3 detection rule, RAG context, tool-forge body) is still excluded:
 * that is session content, not configuration, and it does not belong in a URL.
 */

export interface ShareState {
  dojoId: DojoId;
  scenario: Scenario | null;
  controlConfig: ControlConfig;
  dojo2Config: Dojo2Config;
  dojo3Config: Dojo3Config;
}

const SCENARIOS_BY_ID = new Map(SCENARIOS.map((s) => [s.id, s] as const));

function bool(v: boolean): '1' | '0' {
  return v ? '1' : '0';
}

/** Membership test against a literal-union's allowed values. */
function oneOf<T extends string>(allowed: readonly T[]) {
  return (v: string | null): v is T => v !== null && (allowed as readonly string[]).includes(v);
}

const isShield     = oneOf(['off', 'basic', 'strict'] as const);
const isPersona    = oneOf(['analyst', 'ciso', 'ir-lead'] as const);
const isFormat     = oneOf(['markdown', 'json', 'report'] as const);
const isDepth      = oneOf(['basic', 'standard', 'deep'] as const);
const isStyle      = oneOf(['concise', 'detailed', 'structured'] as const);
const isContext    = oneOf(['none', 'limited', 'full'] as const);
const isConfidence = oneOf(['low', 'medium', 'high'] as const);
const isRisk       = oneOf(['low', 'medium', 'high', 'critical'] as const);
const isLens       = oneOf(['all', 'nist', 'eu', 'iso'] as const);
const isTier       = oneOf(['unset', 'prohibited', 'high', 'limited', 'minimal'] as const);

/**
 * Multi-select lists travel as indices into their source array, because the
 * options themselves are full sentences and a link carrying four of them would
 * run past a thousand characters.
 *
 * The cost is that POLICY_CLAUSES and VENDOR_GAP_AREAS must be treated as
 * append-only: reordering or removing an entry re-points every link already
 * shared. Out-of-range indices are dropped rather than guessed.
 */
function encodeIndices(selected: string[], source: readonly string[]): string {
  return selected
    .map((v) => source.indexOf(v))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)
    .join('.');
}

function decodeIndices(raw: string | null, source: readonly string[]): string[] | null {
  if (!raw) return null;
  const picked = raw
    .split('.')
    .map((n) => Number.parseInt(n, 10))
    .filter((n) => Number.isInteger(n) && n >= 0 && n < source.length)
    .map((n) => source[n]);
  return picked.length ? [...new Set(picked)] : null;
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
    const d = DEFAULT_DOJO2_CONFIG;
    if (dc.persona           !== d.persona)           p.set('p',   dc.persona);
    if (dc.outputFormat      !== d.outputFormat)      p.set('f',   dc.outputFormat);
    if (dc.analysisDepth     !== d.analysisDepth)     p.set('ad',  dc.analysisDepth);
    if (dc.responseStyle     !== d.responseStyle)     p.set('rs',  dc.responseStyle);
    if (dc.contextLevel      !== d.contextLevel)      p.set('cx',  dc.contextLevel);
    if (dc.confidenceLevel   !== d.confidenceLevel)   p.set('cf',  dc.confidenceLevel);
    if (dc.riskAssessment    !== d.riskAssessment)    p.set('ra',  dc.riskAssessment);
    if (dc.iocExtraction     !== d.iocExtraction)     p.set('ioc', bool(dc.iocExtraction));
    if (dc.mitreMapping      !== d.mitreMapping)      p.set('mit', bool(dc.mitreMapping));
    if (dc.threatCorrelation !== d.threatCorrelation) p.set('tc',  bool(dc.threatCorrelation));
  }

  if (state.dojoId === 3) {
    const tc = state.dojo3Config;
    const d = DEFAULT_DOJO3_CONFIG;
    if (tc.frameworkLens !== d.frameworkLens) p.set('fl', tc.frameworkLens);
    if (tc.riskTier      !== d.riskTier)      p.set('rt', tc.riskTier);
    const vg = encodeIndices(tc.vendorGapAreas, VENDOR_GAP_AREAS);
    if (vg) p.set('vg', vg);
    const pc = encodeIndices(tc.selectedClauses, POLICY_CLAUSES);
    if (pc) p.set('pc', pc);
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
  if (isShield(shield)) { cc.injectionShield = shield; touchedCC = true; }
  if (p.has('strict')) { cc.strictPolicy = p.get('strict') === '1'; touchedCC = true; }
  if (p.has('tools'))  { cc.allowTools   = p.get('tools')  === '1'; touchedCC = true; }
  if (p.has('rag'))    { cc.ragEnabled   = p.get('rag')    === '1'; touchedCC = true; }
  if (touchedCC) out.controlConfig = cc;

  const dc: Dojo2Config = { ...DEFAULT_DOJO2_CONFIG };
  let touchedDC = false;
  const persona = p.get('p');
  if (isPersona(persona))    { dc.persona         = persona; touchedDC = true; }
  const format = p.get('f');
  if (isFormat(format))      { dc.outputFormat    = format;  touchedDC = true; }
  const depth = p.get('ad');
  if (isDepth(depth))        { dc.analysisDepth   = depth;   touchedDC = true; }
  const style = p.get('rs');
  if (isStyle(style))        { dc.responseStyle   = style;   touchedDC = true; }
  const context = p.get('cx');
  if (isContext(context))    { dc.contextLevel    = context; touchedDC = true; }
  const conf = p.get('cf');
  if (isConfidence(conf))    { dc.confidenceLevel = conf;    touchedDC = true; }
  const risk = p.get('ra');
  if (isRisk(risk))          { dc.riskAssessment  = risk;    touchedDC = true; }
  if (p.has('ioc')) { dc.iocExtraction     = p.get('ioc') === '1'; touchedDC = true; }
  if (p.has('mit')) { dc.mitreMapping      = p.get('mit') === '1'; touchedDC = true; }
  if (p.has('tc'))  { dc.threatCorrelation = p.get('tc')  === '1'; touchedDC = true; }
  if (touchedDC) out.dojo2Config = dc;

  const tc: Dojo3Config = { ...DEFAULT_DOJO3_CONFIG };
  let touchedTC = false;
  const lens = p.get('fl');
  if (isLens(lens)) { tc.frameworkLens = lens; touchedTC = true; }
  const tier = p.get('rt');
  if (isTier(tier)) { tc.riskTier = tier; touchedTC = true; }
  const vendorGaps = decodeIndices(p.get('vg'), VENDOR_GAP_AREAS);
  if (vendorGaps) { tc.vendorGapAreas = vendorGaps; touchedTC = true; }
  const clauses = decodeIndices(p.get('pc'), POLICY_CLAUSES);
  if (clauses) { tc.selectedClauses = clauses; touchedTC = true; }
  if (touchedTC) out.dojo3Config = tc;

  return out;
}
