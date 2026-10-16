import type { ReactNode } from 'react';
import { Link } from 'react-router';
import facebookIcon from '@/assets/icons/social-facebook-light.svg';
import instagramIcon from '@/assets/icons/social-instagram-light.svg';
import { ContactButton } from '@/components/contact/ContactButton';
import { EmailAddress } from '@/components/contact/EmailAddress';
import { CONTACT, CONTACT_DETAILS_CONFIRMED, emailHref, phoneHref } from '@/config/contact';
import { whatsappHref } from '@/lib/whatsapp';
import { OfficeAddress, OpeningHours } from '@/components/contact/OfficeDetails';
import { SITE } from '@/config/site';
import { featuredProject } from '@/data/projects';
import { routes } from '@/lib/routes';
import { Logo } from './Logo';

// inline-flex + min-h-6: every text link is at least 24px tall (WCAG 2.5.8) without changing the rhythm;
// on touch screens 44px, with the list spacing folded into the taller rows.
const LINK = 'inline-flex min-h-6 items-center pointer-coarse:min-h-11 transition-colors hover:text-accent';

/** Pozhegu's own social icons (white footer variants from pozhegubrothers.com, unmodified). */
const SOCIAL_LINKS = [
  { label: 'Pozhegu Brothers në Facebook', href: CONTACT.social.facebook, icon: facebookIcon },
  { label: 'Pozhegu Brothers në Instagram', href: CONTACT.social.instagram, icon: instagramIcon },
] as const;

function FooterColumn({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow text-inverse-muted">{title}</h2>
      <div className="mt-5 text-small">{children}</div>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const whatsapp = whatsappHref();

  return (
    <footer className="bg-ink text-white">
      <div className="page-container pt-section-sm pb-10">
        <div className="page-grid gap-y-14">
          <div className="col-span-full md:col-span-8 lg:col-span-4">
            <Logo />
            <p className="mt-10 max-w-[22ch] text-subheading text-white">
              Keni pyetje për një banesë? Na shkruani dhe zyra e shitjes ju kontakton.
            </p>
            <ul className="mt-8 -ml-3 flex gap-1">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-xs transition-opacity hover:opacity-60"
                  >
                    <img src={social.icon} alt="" width={20} height={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-full md:col-span-3 lg:col-span-3 lg:col-start-6">
            <FooterColumn title="Kontakti">
              {CONTACT_DETAILS_CONFIRMED ? (
                <ul className="space-y-2.5 pointer-coarse:space-y-0">
                  <li>
                    <a href={phoneHref} className={`${LINK} tabular-nums`}>
                      {CONTACT.phoneDisplay}
                    </a>
                  </li>
                  {whatsapp ? (
                    <li>
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={LINK}>
                        WhatsApp
                      </a>
                    </li>
                  ) : null}
                  <li>
                    <a href={emailHref()} className={`${LINK} break-words`}>
                      <EmailAddress email={CONTACT.email} />
                    </a>
                  </li>
                </ul>
              ) : (
                <ContactButton appearance="link" className="min-h-6 pointer-coarse:min-h-11" />
              )}
            </FooterColumn>
          </div>

          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <FooterColumn title={CONTACT.office.name}>
              <OfficeAddress />
              <OpeningHours className="mt-4 text-inverse-muted" />
            </FooterColumn>
          </div>

          <div className="col-span-2 md:col-span-2">
            <FooterColumn title={featuredProject.name}>
              <ul className="space-y-2.5 pointer-coarse:space-y-0">
                {featuredProject.buildings.map((building) => (
                  <li key={building.id}>
                    <Link to={routes.building(building.id)} className={LINK}>
                      {building.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </div>
        </div>

        <div className="mt-section-sm flex flex-col gap-2 border-t border-line-inverse pt-6 text-caption text-inverse-muted sm:flex-row sm:justify-between">
          <p>
            © {year} {SITE.company}. Të gjitha të drejtat e rezervuara.
          </p>
          <p>Pamjet e paraqitura janë ilustruese.</p>
        </div>
      </div>
    </footer>
  );
}
