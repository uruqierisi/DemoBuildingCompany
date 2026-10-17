import { parsePhone } from './phone';

/** Digits without "+" as wa.me expects, or null when unset or invalid. */
function toWhatsappDigits(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  const parsed = parsePhone(value);
  if (!parsed.ok) {
    if (import.meta.env.DEV) console.error(`Invalid WhatsApp number: "${value}" (${parsed.error}).`);
    return null;
  }
  return parsed.e164.slice(1);
}

/**
 * The WhatsApp number in use, from VITE_WHATSAPP_NUMBER only (.env.local, or the host's environment
 * variables). Unset by default, which hides every WhatsApp action, including the lead form hand-off.
 */
export const WHATSAPP_DIGITS = toWhatsappDigits(import.meta.env.VITE_WHATSAPP_NUMBER);

/** wa.me link with an optional pre-written message; null when no WhatsApp number is configured. */
export function whatsappHref(message?: string): string | null {
  if (!WHATSAPP_DIGITS) return null;
  const base = `https://wa.me/${WHATSAPP_DIGITS}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
