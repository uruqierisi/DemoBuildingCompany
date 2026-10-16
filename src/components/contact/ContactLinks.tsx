import { Icon, type IconName } from '@/components/ui/Icon';
import { CONTACT, emailHref, phoneHref } from '@/config/contact';
import { EmailAddress } from './EmailAddress';
import { whatsappHref } from '@/lib/whatsapp';

interface ContactLinksProps {
  /** Pre-filled WhatsApp message and e-mail subject, e.g. naming the project or apartment. */
  readonly topic: string;
}

interface ContactLinkItem {
  readonly label: string;
  readonly value: string;
  readonly href: string;
  readonly icon: IconName;
  readonly isExternal?: boolean;
  readonly isNumeric?: boolean;
  readonly isEmail?: boolean;
}

/** Large call / WhatsApp / e-mail rows. Every row is a real tel:, wa.me or mailto: link. */
export function ContactLinks({ topic }: ContactLinksProps) {
  const whatsapp = whatsappHref(`Përshëndetje, jam i interesuar për ${topic}.`);
  const items: readonly ContactLinkItem[] = [
    { label: 'Telefon', value: CONTACT.phoneDisplay, href: phoneHref, icon: 'arrow-right', isNumeric: true },
    ...(whatsapp
      ? [
          {
            label: 'WhatsApp',
            value: 'Shkruani në WhatsApp',
            href: whatsapp,
            icon: 'arrow-up-right',
            isExternal: true,
          } as const,
        ]
      : []),
    { label: 'E-mail', value: CONTACT.email, href: emailHref(topic), icon: 'arrow-right', isEmail: true },
  ];

  return (
    <ul className="border-t border-line">
      {items.map((item) => (
        <li key={item.label} className="border-b border-line">
          <a
            href={item.href}
            {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="group flex items-center justify-between gap-6 py-6 lg:py-8"
          >
            <span className="min-w-0">
              <span className="block eyebrow text-ink-muted">{item.label}</span>
              <span
                className={`mt-3 block text-subheading break-words transition-colors group-hover:text-accent-ink lg:text-[1.875rem] lg:leading-tight ${item.isNumeric ? 'tabular-nums' : ''}`}
              >
                {item.isEmail ? <EmailAddress email={item.value} /> : item.value}
              </span>
            </span>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xs border border-line-strong transition-colors group-hover:border-accent group-hover:bg-accent">
              <Icon
                name={item.icon}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-1"
              />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
