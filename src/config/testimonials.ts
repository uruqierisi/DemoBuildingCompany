export interface Testimonial {
  readonly id: string;
  /** Quote text without surrounding quotation marks. */
  readonly quote: string;
  readonly name: string;
}

/**
 * Client testimonials as published on https://pozhegubrothers.com/ ("Nga Klientët tanë"),
 * retrieved 2026-09-28. Text is unchanged apart from obvious spelling slips:
 * - Radoncic: "knaqur" → "kënaqur", "Dritare" → "Dritaret", "të gjana" → "të gjera", "jepin" → "japin",
 *   "siq" → "siç", "gatëshëm" → "gatshëm", "PozheguBrothers" → "Pozhegu Brothers" (twice).
 * - Ahmeti: "maksimalishtë" → "maksimalisht", "korrektësin e kompanis" → "korrektësinë e kompanisë",
 *   "mjaftë" → "mjaft", "banorë" → "banor", "njëren" → "njërin" / "njërën".
 * - Uka: comma after "Të nderuar", "poashtu" → "po ashtu", "korrektesin" → "korrektësinë".
 * - Mehmeti: "mundesitë" → "mundësitë".
 * Dialect forms ("për me ndihmu") are kept as written.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: 'radoncic',
    name: 'Bernada Radoncic',
    quote:
      'Me banesën time të re, jam shumë e kënaqur me përfundimin e banesës. Dritaret janë të gjera dhe japin shumë dritë, dyshemeja është vendosur bukur, dyert të bukura dhe plani i banesës është ashtu siç e kemi dëshiruar. Punëtorët e Pozhegu Brothers janë gjithmonë të gatshëm për me ndihmu dhe të kuptueshëm ndaj klientit. E rekomandoj çdo klient tek Pozhegu Brothers me padyshim!',
  },
  {
    id: 'ahmeti',
    name: 'Lulzim Ahmeti',
    quote:
      'Jam i kënaqur maksimalisht me kualitetin e ndërtimit, korrektësinë e kompanisë si dhe kujdesin në objekte. Po ashtu mirëmbajtja është në nivel të duhur dhe pastërtia është mjaft e mirë. Si banor në njërin nga objektet e Pozhegu Brothers, jam i lumtur dhe i kënaqur që jam në njërën prej banesave. Po ashtu edhe termoizolimi dhe izolimi akustik janë në nivelin e duhur.',
  },
  {
    id: 'uka',
    name: 'Esad Uka',
    quote:
      'Të nderuar, në përgjithësi jam i kënaqur si me shërbimet ndaj meje po ashtu edhe me precizitetin dhe korrektësinë e treguar dhe gjithashtu me afatin e ndërtimit.',
  },
  {
    id: 'mehmeti',
    name: 'Fidan Mehmeti',
    quote:
      'Jam i kënaqur me kualitetin e ndërtimit, mundësitë e pagesave si dhe stafin me sjellje të shkëlqyeshme të kompanisë.',
  },
];
