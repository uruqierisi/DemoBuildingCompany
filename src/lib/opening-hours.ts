/**
 * Opening hours stored per day, formatted on demand: compactly in Albanian for the page
 * ("E hënë – e premte: 09:00–17:00") and grouped for schema.org. Kept free of app aliases and
 * browser APIs, so the build (JSON-LD in index.html) can use it too.
 */

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** 24-hour "HH:MM" times; null means closed that day. */
export type DayHours = { readonly opens: string; readonly closes: string } | null;
export type WeeklyHours = Readonly<Record<Weekday, DayHours>>;

const DAY_LABELS: Readonly<Record<Weekday, string>> = {
  monday: 'E hënë',
  tuesday: 'E martë',
  wednesday: 'E mërkurë',
  thursday: 'E enjte',
  friday: 'E premte',
  saturday: 'E shtunë',
  sunday: 'E diel',
};

const SCHEMA_DAYS: Readonly<Record<Weekday, string>> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const CLOSED_LABEL = 'Mbyllur';

interface DayRun {
  readonly days: readonly Weekday[];
  readonly hours: DayHours;
}

const sameHours = (a: DayHours, b: DayHours) => a?.opens === b?.opens && a?.closes === b?.closes;

/** Consecutive days with identical hours, Monday first. */
function groupRuns(hours: WeeklyHours): DayRun[] {
  return WEEKDAYS.reduce<DayRun[]>((runs, day) => {
    const last = runs.at(-1);
    if (last && sameHours(last.hours, hours[day])) {
      return [...runs.slice(0, -1), { days: [...last.days, day], hours: last.hours }];
    }
    return [...runs, { days: [day], hours: hours[day] }];
  }, []);
}

export interface HoursLine {
  /** "E hënë – e premte" or a single day, "E shtunë". */
  readonly days: string;
  /** "09:00–17:00" or "Mbyllur". */
  readonly time: string;
}

/** Compact Albanian lines: runs of days that share the same hours. */
export function formatOpeningHours(hours: WeeklyHours): HoursLine[] {
  return groupRuns(hours).map(({ days, hours: dayHours }) => {
    const first = DAY_LABELS[days[0] ?? 'monday'];
    const last = days.length > 1 ? DAY_LABELS[days[days.length - 1] ?? 'sunday'] : null;
    return {
      // Only the first word of a sentence is capitalised in Albanian: "E hënë – e premte".
      days: last ? `${first} – ${last.charAt(0).toLowerCase()}${last.slice(1)}` : first,
      time: dayHours ? `${dayHours.opens}–${dayHours.closes}` : CLOSED_LABEL,
    };
  });
}

export interface OpeningHoursSpecification {
  readonly '@type': 'OpeningHoursSpecification';
  readonly dayOfWeek: string[];
  readonly opens: string;
  readonly closes: string;
}

/** schema.org openingHoursSpecification: days sharing the same hours together; closed days omitted. */
export function toOpeningHoursSpecification(hours: WeeklyHours): OpeningHoursSpecification[] {
  const byHours = new Map<string, Weekday[]>();
  for (const day of WEEKDAYS) {
    const dayHours = hours[day];
    if (!dayHours) continue;
    const key = `${dayHours.opens}-${dayHours.closes}`;
    byHours.set(key, [...(byHours.get(key) ?? []), day]);
  }
  return [...byHours.entries()].map(([key, days]) => {
    const [opens = '', closes = ''] = key.split('-');
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: days.map((day) => SCHEMA_DAYS[day]), opens, closes };
  });
}
