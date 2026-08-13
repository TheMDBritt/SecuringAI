/**
 * OWASP Top 10 for LLM Applications, 2026 edition.
 *
 * Published 4 August 2026 by the OWASP GenAI Security Project. The 2026 list
 * was the first ranked partly on real incident data (75% community vote, 25%
 * from 7,714 recorded incidents) rather than vote alone, and it reordered most
 * of the list.
 *
 * This matters for study material because the codes are NOT stable across
 * editions. "LLM08" meant Excessive Agency in 2023, Vector and Embedding
 * Weaknesses in 2025, and Hidden Context Exposure in 2026. A learner who
 * memorises a code from the wrong edition answers incorrectly. This module is
 * the single source of truth, and tests/content-integrity.test.ts enforces it
 * across the question bank.
 *
 * Source: genai.owasp.org, OWASP GenAI LLM Top 10 2026.
 */

export const OWASP_LLM_2026 = {
  LLM01: 'Prompt Injection',
  LLM02: 'Sensitive Information Disclosure',
  LLM03: 'Excessive Agency',
  LLM04: 'Supply Chain',
  LLM05: 'Data and Model Poisoning',
  LLM06: 'Unbounded Consumption',
  LLM07: 'Misinformation',
  LLM08: 'Hidden Context Exposure',
  LLM09: 'Vector and Embedding Weaknesses',
  LLM10: 'Improper Output Handling',
} as const;

export type OwaspCode = keyof typeof OWASP_LLM_2026;

/**
 * Maps a concept, however it was named in an earlier edition, to its 2026 code.
 * Keys are lowercase and matched loosely, since the same idea appears under
 * several historical labels.
 */
export const CONCEPT_TO_2026: Record<string, OwaspCode> = {
  // Stable across editions
  'prompt injection': 'LLM01',
  'indirect prompt injection': 'LLM01',
  'sensitive information disclosure': 'LLM02',
  'sensitive info disclosure': 'LLM02',
  'sensitive data disclosure': 'LLM02',

  // Moved
  'excessive agency': 'LLM03',
  'supply chain': 'LLM04',
  'supply chain vulnerabilities': 'LLM04',
  'data and model poisoning': 'LLM05',
  'training data poisoning': 'LLM05',
  'model poisoning': 'LLM05',
  'unbounded consumption': 'LLM06',
  'model denial of service': 'LLM06',
  'model dos': 'LLM06',
  'model theft': 'LLM06',
  'misinformation': 'LLM07',
  'overreliance': 'LLM07',

  // Renamed
  'hidden context exposure': 'LLM08',
  'system prompt leakage': 'LLM08',
  'vector and embedding weaknesses': 'LLM09',
  'improper output handling': 'LLM10',
  'insecure output handling': 'LLM10',

  // Retired as a standalone entry, folded into Excessive Agency
  'insecure plugin design': 'LLM03',
};

/** Renders the canonical label, e.g. "LLM03 Excessive Agency". */
export function owaspLabel(code: OwaspCode): string {
  return `${code} ${OWASP_LLM_2026[code]}`;
}
