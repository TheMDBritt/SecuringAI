import { Suspense } from 'react';
import PlaybookView from '@/components/playbook/PlaybookView';
import { CONTENT_COUNTS } from '@/lib/content-counts';

const { quizQuestions, glossaryTerms, topicArticles, certs } = CONTENT_COUNTS;

// Counts are derived here, in a server component, and passed down as plain
// numbers. Importing the data modules into the client view would undo the
// dynamic splitting inside PlaybookView and put the whole library back in the
// first-load bundle.
export const metadata = {
  title: 'Playbook',
  description:
    `${quizQuestions.toLocaleString()} practice questions, ` +
    `${glossaryTerms.toLocaleString()} glossary terms, ` +
    `${topicArticles} topic articles and ${certs} cert maps. ` +
    'Select a certification, drill its official exam domains, and get a ' +
    'per-domain score breakdown. Covers CompTIA SecAI+, EC-Council C|AI ' +
    'Security, GIAC GOAA and GASAE, Microsoft SC-500, AWS AIF-C01, AWS ' +
    'Security Specialty, Azure AI-103 and more.',
};

// PlaybookView calls useSearchParams() for deep-link support
// (?section=progress&session=<id>). Next.js requires that to live inside a
// Suspense boundary or the whole page opts out of static prerendering.
export default function PlaybookPage() {
  return (
    <div className="flex h-[calc(100vh-56px)] flex-col">
      <Suspense fallback={null}>
        <PlaybookView
          counts={{
            questions: quizQuestions,
            glossary: glossaryTerms,
            articles: topicArticles,
            certs,
          }}
        />
      </Suspense>
    </div>
  );
}
