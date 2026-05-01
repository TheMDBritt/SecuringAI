import Link from 'next/link';

export const metadata = {
  title: 'Not found',
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-20 text-center">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">
        404
      </p>
      <h1 className="text-3xl md:text-5xl font-bold text-slate-100 tracking-tight mb-4">
        That page doesn&apos;t exist.
      </h1>
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
        The link may be stale, or the route was renamed. Everything that exists
        is reachable from the navigation above.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
        >
          Home
        </Link>
        <Link
          href="/dojo"
          className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 text-sm font-medium transition-colors"
        >
          Enter the dojo
        </Link>
      </div>
    </div>
  );
}
