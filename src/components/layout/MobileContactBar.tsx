import { Icon } from '@/components/ui/Icon';
import { ContactButton } from '@/components/contact/ContactButton';
import { CONTACT_DETAILS_CONFIRMED, phoneHref } from '@/config/contact';
import { useIsEditingText } from '@/hooks/useIsEditingText';
import { cn } from '@/lib/cn';
import { whatsappHref } from '@/lib/whatsapp';

const ACTION =
  'flex h-14 items-center justify-center gap-2.5 text-small font-medium transition-colors active:opacity-90';

interface MobileContactBarProps {
  /** Removes the bar from interaction, e.g. while the mobile menu covers it. */
  readonly isHidden: boolean;
}

/**
 * Call and WhatsApp actions pinned to the bottom of the screen on phones. The page reserves its
 * height (pb-contact-bar on the layout), so it never covers the end of the page. While a form field
 * has focus it slides away: with the keyboard open it would sit on top of the field and the submit button.
 */
export function MobileContactBar({ isHidden }: MobileContactBarProps) {
  const isEditing = useIsEditingText();
  const whatsapp = whatsappHref();
  const barClasses = cn(
    'fixed inset-x-0 bottom-0 z-20 bg-ink pb-[env(safe-area-inset-bottom)] transition-[translate,visibility] md:hidden',
    isEditing && 'invisible translate-y-full',
  );

  if (!CONTACT_DETAILS_CONFIRMED) {
    return (
      <div data-fixed-edge="bottom" inert={isHidden || isEditing} className={barClasses}>
        <ContactButton className="h-14 w-full rounded-none" />
      </div>
    );
  }
  return (
    <div data-fixed-edge="bottom" inert={isHidden || isEditing} className={cn(barClasses, 'grid grid-cols-2')}>
      <a href={phoneHref} className={`${ACTION} text-white hover:bg-ink-soft`}>
        <Icon name="phone" />
        Telefono
      </a>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${ACTION} bg-accent text-ink hover:bg-accent-hover`}
        >
          <Icon name="chat" />
          WhatsApp
        </a>
      ) : (
        <ContactButton className="h-14 rounded-none" />
      )}
    </div>
  );
}
