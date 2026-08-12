/**
 * Single source of truth for "how much content is in here" figures.
 *
 * These numbers appear in page metadata, marketing copy, tab labels and the
 * footer. They used to be hardcoded per site and had drifted badly: the
 * playbook advertised 1,731 questions and 76 articles against an actual 1,876
 * and 98, and two pages disagreed about the scenario count. Anyone who counted
 * would have caught it.
 *
 * Importing this module pulls in the data modules to count them, so it is safe
 * only in SERVER components and build-time metadata. Client components that
 * merely display a count should import the frozen numbers below, which Next
 * inlines at build time without dragging the data into the browser bundle.
 */

import { QUIZ_QUESTIONS } from './playbook-quiz';
import { GLOSSARY_TERMS } from './playbook-glossary';
import { TOPIC_ARTICLES } from './playbook-content';
import { EXAM_CERTS } from './cert-exam-domains';
import { SECAI_DRILLS } from './secai-drills';
import { SC500_DRILLS } from './sc500-drills';
import { AWS_SCSC03_DRILLS } from './aws-scsc03-drills';

export const CONTENT_COUNTS = {
  quizQuestions: QUIZ_QUESTIONS.length,
  glossaryTerms: GLOSSARY_TERMS.length,
  topicArticles: TOPIC_ARTICLES.length,
  certs: EXAM_CERTS.length,
  drills: SECAI_DRILLS.length + SC500_DRILLS.length + AWS_SCSC03_DRILLS.length,
  drillSteps:
    SECAI_DRILLS.reduce((n, d) => n + d.steps.length, 0) +
    SC500_DRILLS.reduce((n, d) => n + d.steps.length, 0) +
    AWS_SCSC03_DRILLS.reduce((n, d) => n + d.steps.length, 0),
} as const;

/** Rounded down to the nearest hundred, for prose that should not churn. */
export function approx(n: number): string {
  return `${Math.floor(n / 100) * 100}+`;
}
