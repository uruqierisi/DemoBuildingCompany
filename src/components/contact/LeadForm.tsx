import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { buttonArrowClasses, buttonClasses } from '@/components/ui/button-styles';
import { Icon } from '@/components/ui/Icon';
import { whatsappHref } from '@/lib/whatsapp';
import { SalesPhoneLine } from './OfficeDetails';
import { cn } from '@/lib/cn';
import { formatApartmentCode } from '@/lib/format';
import { buildWhatsappMessage, describeSubject, type LeadSubject } from '@/lib/lead-message';
import { parsePhone, PHONE_ERROR_MESSAGES } from '@/lib/phone';

/** Simulated send time: there is no backend in the demo, the form only shows its success state. */
const SIMULATED_SEND_MS = 700;
const NAME_MIN_LENGTH = 2;

interface LeadFormProps {
  /** What the request is about; shown above the fields and submitted with them. */
  readonly subject?: LeadSubject;
  readonly initialMessage?: string;
  /** Adds a close button to the success state, e.g. to close the dialog. */
  readonly onDone?: () => void;
}

type FieldName = 'name' | 'phone';
type Errors = Partial<Record<FieldName, string>>;

interface SentLead {
  readonly name: string;
  readonly phoneDisplay: string;
  readonly message: string;
}

function validate(data: FormData): Errors {
  const name = String(data.get('name') ?? '').trim();
  const phone = parsePhone(String(data.get('phone') ?? ''));
  return {
    ...(name.length < NAME_MIN_LENGTH ? { name: 'Shkruani emrin tuaj, që ta dimë kë të kërkojmë.' } : {}),
    ...(phone.ok ? {} : { phone: PHONE_ERROR_MESSAGES[phone.error] }),
  };
}

const FIELD =
  'mt-2 block w-full rounded-xs border border-line-strong bg-white px-4 py-3 text-body text-ink placeholder:text-ink-muted focus-visible:outline-offset-1 aria-[invalid=true]:border-danger';
const LABEL = 'block text-small font-medium';
const ERROR = 'mt-2 text-small text-danger';

/**
 * Lead form: name, phone and an optional message. Validates on submit, then live while the visitor
 * corrects a field; shows a success state that can hand the same request over to WhatsApp.
 */
export function LeadForm({ subject, initialMessage = '', onDone }: LeadFormProps) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [sent, setSent] = useState<SentLead | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const found = validate(data);
    setErrors(found);
    setHasSubmitted(true);
    const first = (['name', 'phone'] as const).find((field) => found[field]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const phone = parsePhone(String(data.get('phone')));
    setSent({
      name: String(data.get('name')).trim(),
      phoneDisplay: phone.ok ? phone.display : '',
      message: String(data.get('message') ?? ''),
    });
    setStatus('sending');
    timerRef.current = window.setTimeout(() => setStatus('sent'), SIMULATED_SEND_MS);
  };

  // After the first submit, errors clear as soon as a field is corrected.
  const handleChange = () => {
    if (hasSubmitted && formRef.current) setErrors(validate(new FormData(formRef.current)));
  };

  if (status === 'sent' && sent) return <LeadSuccess lead={sent} subject={subject} onDone={onDone} />;

  const rows = subject ? describeSubject(subject) : [];
  const isSending = status === 'sending';
  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} onChange={handleChange} className="space-y-6">
      {rows.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-4 text-small sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {subject?.apartment ? <input type="hidden" name="apartmentId" value={subject.apartment.id} /> : null}
      {subject?.buildingName ? <input type="hidden" name="building" value={subject.buildingName} /> : null}

      <div>
        <label className={LABEL} htmlFor={`${id}-name`}>
          Emri dhe mbiemri
        </label>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          placeholder="p.sh. Arta Krasniqi…"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          className={FIELD}
        />
        {errors.name ? (
          <p id={`${id}-name-error`} className={ERROR}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className={LABEL} htmlFor={`${id}-phone`}>
          Telefoni
        </label>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="04X XXX XXX…"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? `${id}-phone-error` : `${id}-phone-hint`}
          className={FIELD}
        />
        {errors.phone ? (
          <p id={`${id}-phone-error`} className={ERROR}>
            {errors.phone}
          </p>
        ) : (
          <p id={`${id}-phone-hint`} className="mt-2 text-small text-ink-muted">
            P.sh. 04X XXX XXX ose +383 4X XXX XXX; nga jashtë, me prefiksin e shtetit.
          </p>
        )}
      </div>

      <div>
        <label className={LABEL} htmlFor={`${id}-message`}>
          Mesazhi <span className="font-normal text-ink-muted">(opsional)</span>
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={3}
          defaultValue={initialMessage}
          autoComplete="off"
          className={cn(FIELD, 'resize-y')}
        />
      </div>

      <button type="submit" disabled={isSending} className={buttonClasses('primary', 'lg', 'w-full sm:w-auto')}>
        {isSending ? 'Duke dërguar…' : 'Dërgo kërkesën'}
        {isSending ? null : <Icon name="arrow-right" className={buttonArrowClasses} />}
      </button>
    </form>
  );
}

interface LeadSuccessProps {
  readonly lead: SentLead;
  readonly subject?: LeadSubject;
  readonly onDone?: () => void;
}

function LeadSuccess({ lead, subject, onDone }: LeadSuccessProps) {
  const headingRef = useRef<HTMLParagraphElement>(null);
  // The form is gone; move focus to the confirmation so keyboard and screen-reader users land on it.
  useEffect(() => headingRef.current?.focus(), []);

  const firstName = lead.name.split(/\s+/)[0] ?? '';
  const apartmentId = subject?.apartment?.id;
  const whatsapp = subject
    ? whatsappHref(buildWhatsappMessage({ subject, name: lead.name, message: lead.message }))
    : null;

  return (
    <div role="status" className="py-2">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-ink">
        <Icon name="check" size={24} />
      </span>
      <p ref={headingRef} tabIndex={-1} className="mt-6 text-subheading outline-none">
        Faleminderit, {firstName}.
      </p>
      <p className="mt-3 max-w-[44ch] text-ink-muted">
        Kërkesa juaj{apartmentId ? ` për banesën ${formatApartmentCode(apartmentId)}` : ''} u dërgua. Zyra e shitjes do
        t’ju kontaktojë në <span className="whitespace-nowrap text-ink tabular-nums">{lead.phoneDisplay}</span>.
      </p>
      <SalesPhoneLine label="Nëse ju ngutet, telefononi zyrën e shitjes" className="mt-3 text-small text-ink-muted" />

      {whatsapp ? (
        <p className="mt-8 max-w-[44ch] border-t border-line pt-6 text-small text-ink-muted">
          Doni përgjigje më shpejt? Hapni WhatsApp me një mesazh të gatshëm, që mund ta ndryshoni para se ta dërgoni.
        </p>
      ) : null}
      {whatsapp || onDone ? (
        <div className={cn('flex flex-col gap-3 sm:flex-row', whatsapp ? 'mt-4' : 'mt-8')}>
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonClasses('primary', 'md')}>
              <Icon name="chat" />
              Dërgo edhe në WhatsApp
              <span className="sr-only"> (hapet në dritare të re)</span>
            </a>
          ) : null}
          {onDone ? (
            <button type="button" className={buttonClasses(whatsapp ? 'outline' : 'dark', 'md')} onClick={onDone}>
              Mbyll
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
