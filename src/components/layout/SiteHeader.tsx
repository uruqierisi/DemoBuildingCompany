import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { buttonClasses } from '@/components/ui/button-styles';
import { Icon } from '@/components/ui/Icon';
import { CONTACT_DETAILS, phoneHref } from '@/config/contact';
import { NAV_ITEMS, SITE } from '@/config/site';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { MOBILE_MENU_ID, MobileMenu } from './MobileMenu';
import { SectionLink } from './SectionLink';

interface SiteHeaderProps {
  /** The page starts with a dark full-bleed image: render light text until the user scrolls. */
  readonly overlaysHero: boolean;
  /** True once the page has scrolled past the top. */
  readonly isScrolled: boolean;
  readonly isMenuOpen: boolean;
  readonly onMenuToggle: () => void;
  readonly onMenuClose: () => void;
}

const NAV_LINK =
  'relative py-2 text-small font-medium after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left ' +
  'after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100';

export function SiteHeader({ overlaysHero, isScrolled, isMenuOpen, onMenuToggle, onMenuClose }: SiteHeaderProps) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isOverHero = overlaysHero && !isScrolled && !isMenuOpen;
  const isInverse = isMenuOpen || isOverHero;
  const hasSurface = isScrolled && !isMenuOpen;

  // Escape closes the menu and returns focus to the toggle.
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onMenuClose();
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, onMenuClose]);

  // Lock page scroll behind the open menu.
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [isMenuOpen]);

  const handleToggle = () => {
    onMenuToggle();
    // Keep focus on the toggle when closing so keyboard users don't lose their place.
    if (isMenuOpen) toggleRef.current?.focus();
  };

  return (
    <header
      data-fixed-edge="top"
      className={cn('fixed inset-x-0 top-0 z-40 transition-colors duration-300', isInverse ? 'text-white' : 'text-ink')}
    >
      {/* Surface fades in on scroll; only its opacity animates. */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 border-b border-line bg-paper/88 backdrop-blur-md transition-opacity duration-300',
          hasSurface ? 'opacity-100' : 'opacity-0',
        )}
      />
      {/* While the menu is open its content scrolls beneath the bar: an ink strip (above the menu's z-0,
          below the bar's z-10) keeps it from running under the logo and the close button. */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-5 h-header bg-ink transition-opacity duration-(--duration-panel)',
          isMenuOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div className="relative z-10 page-container flex h-header items-center justify-between gap-6">
        <Link
          to="/"
          className="flex min-h-11 shrink-0 items-center rounded-xs"
          aria-label={`${SITE.company} — faqja kryesore`}
        >
          <Logo isInverse={isInverse} />
        </Link>

        <nav aria-label="Navigimi kryesor" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <li key={item.sectionId}>
                <SectionLink sectionId={item.sectionId} className={NAV_LINK}>
                  {item.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-8 lg:flex">
          {CONTACT_DETAILS ? (
            <a href={phoneHref(CONTACT_DETAILS)} className={cn(NAV_LINK, 'hidden tabular-nums xl:block')}>
              {CONTACT_DETAILS.phoneDisplay}
            </a>
          ) : null}
          <SectionLink
            sectionId="kontakti"
            className={buttonClasses(isInverse ? 'outline-inverse' : 'dark', 'md', 'h-11')}
          >
            Na kontaktoni
          </SectionLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls={MOBILE_MENU_ID}
          onClick={handleToggle}
          className="-mr-3 flex h-12 items-center gap-3 rounded-xs px-3 text-small font-medium lg:hidden"
        >
          <span>{isMenuOpen ? 'Mbyll' : 'Menu'}</span>
          <Icon name={isMenuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={onMenuClose} />
    </header>
  );
}
