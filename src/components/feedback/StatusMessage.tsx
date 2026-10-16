import type { ReactNode } from 'react';

interface StatusMessageProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly actions: ReactNode;
}

/** Full-page message for 404s and unexpected errors, set on the page grid. */
export function StatusMessage({ eyebrow, title, body, actions }: StatusMessageProps) {
  return (
    <section className="page-container py-section">
      <div className="page-grid">
        <div className="col-span-full md:col-span-7 lg:col-span-8 lg:col-start-2">
          <p className="eyebrow text-ink-muted">{eyebrow}</p>
          <h1 className="mt-6 text-title">{title}</h1>
          <p className="mt-8 max-w-[48ch] text-lead text-ink-muted">{body}</p>
          <div className="mt-12 flex flex-wrap gap-3">{actions}</div>
        </div>
      </div>
    </section>
  );
}
