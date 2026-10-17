import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ContactButton } from '@/components/contact/ContactButton';
import { EmailAddress } from '@/components/contact/EmailAddress';
import { OfficeAddress, OpeningHours } from '@/components/contact/OfficeDetails';
import { DemoNotice } from '@/components/demo/DemoNotice';
import { CONTACT_DETAILS, emailHref, phoneHref } from '@/config/contact';
import { DEMO, SITE } from '@/config/site';
import { whatsappHref } from '@/lib/whatsapp';
import { featuredProject } from '@/data/projects';
import { routes } from '@/lib/routes';
import { Logo } from './Logo';

// inline-flex + min-h-6: every text link is at least 24px tall (WCAG 2.5.8) without changing the rhythm;
// on touch screens 44px, with the list spacing folded into the taller rows.
const LINK = 'inline-flex min-h-6 items-center pointer-coarse:min-h-11 transition-colors hover:text-accent';

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
            <Logo isInverse />
            <p className="mt-10 max-w-[22ch] text-subheading text-white">
              Keni pyetje për një banesë? Na shkruani dhe zyra e shitjes ju kontakton.
            </p>
          </div>

          <div className="col-span-full md:col-span-3 lg:col-span-2 lg:col-start-6">
            <FooterColumn title="Kontakti">
              {CONTACT_DETAILS ? (
                <ul className="space-y-2.5 pointer-coarse:space-y-0">
                  <li>
                    <a href={phoneHref(CONTACT_DETAILS)} className={`${LINK} tabular-nums`}>
                      {CONTACT_DETAILS.phoneDisplay}
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
                    <a href={emailHref(CONTACT_DETAILS)} className={`${LINK} break-words`}>
                      <EmailAddress email={CONTACT_DETAILS.email} />
                    </a>
                  </li>
                </ul>
              ) : (
                <ContactButton appearance="link" className="min-h-6 pointer-coarse:min-h-11" />
              )}
            </FooterColumn>
          </div>

          <div className="col-span-full md:col-span-3">
            {CONTACT_DETAILS ? (
              <FooterColumn title={CONTACT_DETAILS.office.name}>
                <OfficeAddress />
                <OpeningHours className="mt-4 text-inverse-muted" />
              </FooterColumn>
            ) : (
              <FooterColumn title="Demo">
                <DemoNotice isInverse />
              </FooterColumn>
            )}
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
          <p>{SITE.company} është ndërtues fiktiv; të gjitha të dhënat në këtë faqe janë shembull.</p>
          <p className="tabular-nums">
            {DEMO.badge} · {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
