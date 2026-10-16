import type { LeadSubject } from '@/lib/lead-message';
import { createContext, useContext, useEffect } from 'react';

export interface ContactRequest {
  /** Dialog heading, e.g. "Kërko planin e banesës". Defaults to "Na kontaktoni". */
  readonly title?: string;
  /** What the request is about (project, building or apartment); defaults to the featured project. */
  readonly subject?: LeadSubject;
  /** Pre-filled message text. */
  readonly message?: string;
}

export type OpenContactDialog = (request?: ContactRequest) => void;

export const ContactDialogContext = createContext<OpenContactDialog | null>(null);

/** Registers what the current page is about, for contact entry points that don't pass a subject. */
export const PageSubjectContext = createContext<((subject: LeadSubject | null) => void) | null>(null);

/**
 * Makes `subject` the default for the contact form while the calling page is mounted, so the header
 * button and the sticky mobile bar pre-fill the apartment or building the visitor is looking at.
 */
export function usePageContactSubject(subject: LeadSubject): void {
  const register = useContext(PageSubjectContext);
  if (!register) throw new Error('usePageContactSubject must be used inside <ContactDialogProvider>.');
  useEffect(() => {
    register(subject);
    return () => register(null);
  }, [register, subject]);
}

/** Opens the site-wide contact form dialog. Must be used below <ContactDialogProvider>. */
export function useContactDialog(): OpenContactDialog {
  const open = useContext(ContactDialogContext);
  if (!open) throw new Error('useContactDialog must be used inside <ContactDialogProvider>.');
  return open;
}
