import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { buttonArrowClasses, buttonClasses, type ButtonSize, type ButtonVariant } from './button-styles';
import { Icon, type IconName } from './Icon';

interface ButtonLookProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  /** Leading icon, e.g. a phone for call buttons. */
  readonly icon?: IconName;
  /** Adds a trailing arrow that moves on hover. */
  readonly withArrow?: boolean;
}

function ButtonContent({ children, icon, withArrow }: Pick<ButtonLookProps, 'children' | 'icon' | 'withArrow'>) {
  return (
    <>
      {icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
      {withArrow ? <Icon name="arrow-right" className={buttonArrowClasses} /> : null}
    </>
  );
}

type ButtonLinkProps = ButtonLookProps & Omit<LinkProps, 'className' | 'children'>;

/** Router link styled as a button, for internal navigation. */
export function ButtonLink({ children, variant, size, className, icon, withArrow, ...linkProps }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...linkProps}>
      <ButtonContent icon={icon} withArrow={withArrow}>
        {children}
      </ButtonContent>
    </Link>
  );
}

type ButtonAnchorProps = ButtonLookProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { readonly href: string };

/** Plain anchor styled as a button, for tel:, mailto: and external URLs (opened in a new tab). */
export function ButtonAnchor({
  children,
  variant,
  size,
  className,
  icon,
  withArrow,
  href,
  ...anchorProps
}: ButtonAnchorProps) {
  const externalProps = href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a href={href} className={buttonClasses(variant, size, className)} {...externalProps} {...anchorProps}>
      <ButtonContent icon={icon} withArrow={withArrow}>
        {children}
      </ButtonContent>
    </a>
  );
}
