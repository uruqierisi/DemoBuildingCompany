import { useCallback, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router';
import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import { DemoBadge } from '@/components/demo/DemoBadge';
import { MobileContactBar } from '@/components/layout/MobileContactBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MAIN_CONTENT_ID, SkipLink } from '@/components/layout/SkipLink';
import { useInView } from '@/hooks/useInView';
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { isRouteHandle } from './route-handle';

export function RootLayout() {
  const location = useLocation();
  const overlaysHero = useMatches().some((match) => isRouteHandle(match.handle) && match.handle.overlaysHero === true);

  // The menu is tied to the location it was opened on, so any navigation closes it.
  // It also closes when the viewport grows past the breakpoint where it is hidden.
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [menuLocationKey, setMenuLocationKey] = useState<string | null>(null);
  const isMenuOpen = menuLocationKey === location.key && !isDesktop;
  const toggleMenu = () => setMenuLocationKey(isMenuOpen ? null : location.key);
  const closeMenu = useCallback(() => setMenuLocationKey(null), []);

  // A 24px sentinel at the top of the document: once it leaves the viewport the header gets its surface.
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const isAtTop = useInView(topSentinelRef, { initialInView: true });

  return (
    <ContactDialogProvider>
      <div className="flex min-h-svh flex-col pb-contact-bar">
        <div ref={topSentinelRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-6" />
        <SkipLink />
        <SiteHeader
          overlaysHero={overlaysHero}
          isScrolled={!isAtTop}
          isMenuOpen={isMenuOpen}
          onMenuToggle={toggleMenu}
          onMenuClose={closeMenu}
        />
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          inert={isMenuOpen}
          className={cn('flex-1 focus:outline-none', !overlaysHero && 'pt-header')}
        >
          <Outlet />
        </main>
        <div inert={isMenuOpen}>
          <SiteFooter />
        </div>
        <MobileContactBar isHidden={isMenuOpen} />
        <DemoBadge isHidden={isMenuOpen} />
        <ScrollRestoration />
      </div>
    </ContactDialogProvider>
  );
}
