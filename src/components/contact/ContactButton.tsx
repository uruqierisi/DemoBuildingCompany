import type { ReactNode } from 'react';
import { buttonArrowClasses, buttonClasses, type ButtonSize, type ButtonVariant } from '@/components/ui/button-styles';
import { Icon } from '@/components/ui/Icon';
import { useContactDialog, type ContactRequest } from './contact-dialog-context';

interface ContactButtonProps {
  readonly children?: ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly request?: ContactRequest;
  /** Called before the dialog opens, e.g. to close the mobile menu. */
  readonly onBeforeOpen?: () => void;
  /** Renders as plain text with an arrow instead of a filled button. */
  readonly appearance?: 'button' | 'link';
}

/** "Na kontaktoni" action that opens the contact form dialog. */
export function ContactButton({
  children = 'Na kontaktoni',
  variant = 'primary',
  size = 'md',
  className,
  request,
  onBeforeOpen,
  appearance = 'button',
}: ContactButtonProps) {
  const openContact = useContactDialog();
  const handleClick = () => {
    onBeforeOpen?.();
    openContact(request);
  };

  if (appearance === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`group/button inline-flex items-center gap-3 transition-colors hover:text-accent ${className ?? ''}`}
      >
        {children}
        <Icon name="arrow-right" className={buttonArrowClasses} />
      </button>
    );
  }
  return (
    <button type="button" onClick={handleClick} className={buttonClasses(variant, size, className)}>
      <span>{children}</span>
      <Icon name="arrow-right" className={buttonArrowClasses} />
    </button>
  );
}
