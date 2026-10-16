/**
 * Phone number parsing for the lead form. Kosovo numbers are checked strictly (local "04X XXX XXX",
 * "+383 4X XXX XXX" or "00383 …"); other international numbers ("+49 …", "0041 …") are accepted
 * with a plain length check, since many buyers live abroad.
 */

export type PhoneError =
  'empty' | 'characters' | 'kosovoLength' | 'kosovoPrefix' | 'missingPrefix' | 'internationalLength';

export type PhoneResult =
  | { readonly ok: true; readonly e164: string; readonly display: string }
  | { readonly ok: false; readonly error: PhoneError };

export const PHONE_ERROR_MESSAGES: Readonly<Record<PhoneError, string>> = {
  empty: 'Shkruani numrin e telefonit, që zyra e shitjes t’ju kontaktojë.',
  characters: 'Numri mund të ketë vetëm shifra, hapësira dhe shenjën + në fillim.',
  kosovoLength: 'Numri duket i paplotë ose ka shifra tepër. Shkruajeni si 04X XXX XXX ose +383 4X XXX XXX.',
  kosovoPrefix:
    'Ky nuk duket numër i Kosovës. Numrat celularë fillojnë me 043–049, ata fiksë me 028, 029, 038 ose 039.',
  missingPrefix: 'Shtoni 0 në fillim (p.sh. 04X XXX XXX) ose prefiksin e shtetit (p.sh. +383).',
  internationalLength: 'Numri ndërkombëtar duket i paplotë. Shkruajeni me prefiksin e shtetit, p.sh. +49 …',
};

const KOSOVO_CODE = '383';
/** National significant number: 8 digits, mobile 43–49, fixed lines 28, 29, 38, 39. */
const KOSOVO_NSN_LENGTH = 8;
const KOSOVO_NSN_PREFIX = /^(4[3-9]|2[89]|3[89])/;
/** ITU E.164 allows at most 15 digits; shorter than 8 is not a callable international number. */
const INTERNATIONAL_MIN_DIGITS = 8;
const INTERNATIONAL_MAX_DIGITS = 15;
const SEPARATORS = /[\s\-./()]/g;

function parseKosovo(nsn: string): PhoneResult {
  if (nsn.length !== KOSOVO_NSN_LENGTH) return { ok: false, error: 'kosovoLength' };
  if (!KOSOVO_NSN_PREFIX.test(nsn)) return { ok: false, error: 'kosovoPrefix' };
  return {
    ok: true,
    e164: `+${KOSOVO_CODE}${nsn}`,
    display: `+${KOSOVO_CODE} ${nsn.slice(0, 2)} ${nsn.slice(2, 5)} ${nsn.slice(5)}`,
  };
}

function parseInternational(digits: string): PhoneResult {
  if (digits.startsWith(KOSOVO_CODE)) {
    // "+383 044 …" is a common mix of both formats; the trunk 0 is dropped.
    const nsn = digits.slice(KOSOVO_CODE.length);
    return parseKosovo(nsn.startsWith('0') ? nsn.slice(1) : nsn);
  }
  if (digits.startsWith('0') || digits.length < INTERNATIONAL_MIN_DIGITS || digits.length > INTERNATIONAL_MAX_DIGITS) {
    return { ok: false, error: 'internationalLength' };
  }
  return { ok: true, e164: `+${digits}`, display: `+${digits}` };
}

export function parsePhone(input: string): PhoneResult {
  const compact = input.trim().replace(SEPARATORS, '');
  if (compact === '') return { ok: false, error: 'empty' };
  if (!/^\+?\d+$/.test(compact)) return { ok: false, error: 'characters' };

  if (compact.startsWith('+')) return parseInternational(compact.slice(1));
  if (compact.startsWith('00')) return parseInternational(compact.slice(2));
  if (compact.startsWith('0')) return parseKosovo(compact.slice(1));
  // Without any prefix, only a complete Kosovo number is unambiguous.
  if (compact.length === KOSOVO_NSN_LENGTH && KOSOVO_NSN_PREFIX.test(compact)) return parseKosovo(compact);
  return { ok: false, error: 'missingPrefix' };
}
