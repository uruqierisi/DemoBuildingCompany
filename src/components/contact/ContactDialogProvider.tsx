import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { featuredProject } from '@/data/projects';
import type { LeadSubject } from '@/lib/lead-message';
import { ContactDialogContext, PageSubjectContext, type ContactRequest } from './contact-dialog-context';
import { LeadForm } from './LeadForm';
import { SalesPhoneLine } from './OfficeDetails';

interface OpenState extends ContactRequest {
  /** Changes on every open, so the form always starts fresh. */
  readonly key: number;
}

/**
 * Site-wide contact form in a native modal <dialog> (focus trap, Escape and backdrop handled by the
 * browser). Components open it with useContactDialog()(request).
 */
export function ContactDialogProvider({ children }: { readonly children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [request, setRequest] = useState<OpenState | null>(null);
  const [pageSubject, setPageSubject] = useState<LeadSubject | null>(null);

  const open = useCallback((next: ContactRequest = {}) => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setRequest((current) => ({ ...next, key: (current?.key ?? 0) + 1 }));
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!request || !dialog || dialog.open) return;
    dialog.showModal();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [request]);

  const handleClose = () => {
    setRequest(null);
    openerRef.current?.focus();
  };

  return (
    <PageSubjectContext.Provider value={setPageSubject}>
      <ContactDialogContext.Provider value={open}>
        {children}
        {/* Backdrop click is a mouse convenience; keyboard users close with Escape (native) or the close button. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
        <dialog
          ref={dialogRef}
          aria-labelledby="contact-dialog-title"
          onClose={handleClose}
          onClick={(event) => {
            if (event.target === event.currentTarget) close(); // click on the backdrop
          }}
          className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-xs bg-paper p-0 text-ink backdrop:bg-ink/60"
        >
          {request ? (
            <div className="animate-rise-in p-6 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <h2 id="contact-dialog-title" className="text-subheading lg:text-[1.875rem] lg:leading-tight">
                  {request.title ?? 'Na kontaktoni'}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Mbyll formularin"
                  className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-xs transition-colors hover:bg-paper-deep"
                >
                  <Icon name="close" />
                </button>
              </div>
              <div className="mt-3 mb-8 max-w-[44ch] space-y-1 text-ink-muted">
                <p>Lini të dhënat tuaja dhe zyra e shitjes ju kontakton.</p>
                <SalesPhoneLine className="text-small" />
              </div>
              <LeadForm
                key={request.key}
                subject={request.subject ?? pageSubject ?? { projectName: featuredProject.name }}
                initialMessage={request.message}
                onDone={close}
              />
            </div>
          ) : null}
        </dialog>
      </ContactDialogContext.Provider>
    </PageSubjectContext.Provider>
  );
}
