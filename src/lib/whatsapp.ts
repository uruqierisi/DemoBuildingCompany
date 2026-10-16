import { WHATSAPP_NUMBER } from '@/config/contact';
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
 * The WhatsApp number in use: WHATSAPP_NUMBER from src/config/contact.ts, else VITE_WHATSAPP_NUMBER
 * (for the demo, ElevateUrBox's own number, set in .env.local or on Netlify). Null hides WhatsApp.
 */
export const WHATSAPP_DIGITS = toWhatsappDigits(WHATSAPP_NUMBER || import.meta.env.VITE_WHATSAPP_NUMBER);

/** wa.me link with an optional pre-written message; null when no WhatsApp number is configured. */
export function whatsappHref(message?: string): string | null {
  if (!WHATSAPP_DIGITS) return null;
  const base = `https://wa.me/${WHATSAPP_DIGITS}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
