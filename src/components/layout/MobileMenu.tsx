import { useEffect, useRef } from 'react';
import { ContactButton } from '@/components/contact/ContactButton';
import { EmailAddress } from '@/components/contact/EmailAddress';
import { CONTACT_DETAILS, emailHref, phoneHref } from '@/config/contact';
import { whatsappHref } from '@/lib/whatsapp';
import { NAV_ITEMS } from '@/config/site';
import { cn } from '@/lib/cn';
import { SectionLink } from './SectionLink';

export const MOBILE_MENU_ID = 'menu-kryesor';

interface MobileMenuProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const CONTACT_LINK = 'block py-1 text-lead text-white transition-colors hover:text-accent';

/**
 * Full-screen navigation for screens below 1024px. Stays mounted so it can fade;
 * `inert` removes it from the tab order and accessibility tree while closed.
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const whatsapp = whatsappHref();

  useEffect(() => {
    if (!isOpen) return;
    firstLinkRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <div
      id={MOBILE_MENU_ID}
      inert={!isOpen}
      className={cn(
        'fixed inset-0 z-0 overflow-y-auto overscroll-contain bg-ink text-white lg:hidden',
        'duration-(--duration-panel)',
        // Visibility flips immediately on open (so focus can move in) and only after the fade on close.
        isOpen ? 'visible opacity-100 transition-opacity' : 'invisible opacity-0 transition-[opacity,visibility]',
      )}
    >
      <div className="page-container flex min-h-full flex-col pt-[calc(var(--header-height)+2.5rem)] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <nav aria-label="Menyja kryesore">
          <ol className="border-t border-line-inverse">
            {NAV_ITEMS.map((item, index) => (
              <li
                key={item.sectionId}
                style={{ transitionDelay: isOpen ? `${80 + index * 60}ms` : '0ms' }}
                className={cn(
                  'border-b border-line-inverse transition-[opacity,transform] duration-(--duration-panel) ease-reveal',
                  isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                )}
              >
                <SectionLink
                  ref={index === 0 ? firstLinkRef : undefined}
                  sectionId={item.sectionId}
                  onNavigate={onClose}
                  className="flex items-baseline gap-5 py-5 text-heading transition-colors hover:text-accent"
                >
                  <span className="w-6 eyebrow text-inverse-muted tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ol>
        </nav>

        {CONTACT_DETAILS ? (
          <div className="mt-auto grid gap-8 pt-14 sm:grid-cols-2">
            <div>
              <p className="eyebrow text-inverse-muted">Telefon</p>
              <a href={phoneHref(CONTACT_DETAILS)} className={cn(CONTACT_LINK, 'mt-3 tabular-nums')}>
                {CONTACT_DETAILS.phoneDisplay}
              </a>
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={CONTACT_LINK}>
                  WhatsApp
                </a>
              ) : null}
            </div>
            <div>
              <p className="eyebrow text-inverse-muted">E-mail</p>
              <a href={emailHref(CONTACT_DETAILS)} className={cn(CONTACT_LINK, 'mt-3 break-words')}>
                <EmailAddress email={CONTACT_DETAILS.email} />
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-14">
            <ContactButton size="lg" onBeforeOpen={onClose} className="w-full sm:w-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
