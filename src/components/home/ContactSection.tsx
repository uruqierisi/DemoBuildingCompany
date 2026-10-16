import { ContactButton } from '@/components/contact/ContactButton';
import { ContactLinks } from '@/components/contact/ContactLinks';
import { OfficeAddress, OpeningHours } from '@/components/contact/OfficeDetails';
import { Section, SectionEyebrow } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { CONTACT, CONTACT_DETAILS_CONFIRMED } from '@/config/contact';

interface ContactSectionProps {
  readonly projectName: string;
}

const SOCIAL = [
  { label: 'Facebook', href: CONTACT.social.facebook },
  { label: 'Instagram', href: CONTACT.social.instagram },
] as const;

export function ContactSection({ projectName }: ContactSectionProps) {
  const request = { message: `Jam i interesuar për ${projectName}.` };

  return (
    <Section id="kontakti" labelledBy="kontakti-titulli" tone="white">
      <div className="page-grid gap-y-12">
        <Reveal className="col-span-full lg:col-span-5">
          <SectionEyebrow index="05" label="Kontakti" />
          <h2 id="kontakti-titulli" className="mt-8 text-heading">
            Flisni me zyrën e shitjes.
          </h2>
          <p className="mt-8 max-w-[44ch] text-lead text-ink-muted">
            {CONTACT_DETAILS_CONFIRMED
              ? 'Për pyetje rreth banesave në shitje, telefononi ose shkruani zyrës së shitjes, ose lini të dhënat tuaja dhe ju kontaktojmë ne.'
              : 'Për pyetje rreth banesave në shitje, lini të dhënat tuaja dhe zyra e shitjes ju kontakton.'}
          </p>

          <div className="mt-12 grid gap-8 text-small sm:grid-cols-2">
            <div>
              <h3 className="eyebrow text-ink-muted">{CONTACT.office.name}</h3>
              <OfficeAddress className="mt-3" />
            </div>
            {CONTACT_DETAILS_CONFIRMED ? (
              <div>
                <h3 className="eyebrow text-ink-muted">Orari</h3>
                <OpeningHours className="mt-3" mutedClassName="text-ink-muted" />
              </div>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={120} className="col-span-full lg:col-span-6 lg:col-start-7">
          {CONTACT_DETAILS_CONFIRMED ? (
            <>
              <ContactLinks topic={projectName} />
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <p className="text-ink-muted">Preferoni që t’ju telefonojmë ne?</p>
                <ContactButton variant="outline" request={request}>
                  Lini të dhënat
                </ContactButton>
              </div>
            </>
          ) : (
            <div className="border-t border-line pt-8 lg:pt-10">
              <p className="eyebrow text-ink-muted">Formulari i kontaktit</p>
              <p className="mt-4 max-w-[34ch] text-subheading lg:text-[1.875rem] lg:leading-tight">
                Tregoni cila banesë ju intereson. Ne ju kontaktojmë.
              </p>
              <ContactButton size="lg" className="mt-10" request={request} />
            </div>
          )}
          <ul className="mt-12 flex gap-8 border-t border-line pt-6 text-small">
            {SOCIAL.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-6 items-center underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink pointer-coarse:min-h-11"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
