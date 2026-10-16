import { describe, expect, it } from 'vitest';
import { formatOpeningHours, toOpeningHoursSpecification, type WeeklyHours } from './opening-hours';

const WEEKDAY = { opens: '09:00', closes: '17:00' } as const;
const office: WeeklyHours = {
  monday: WEEKDAY,
  tuesday: WEEKDAY,
  wednesday: WEEKDAY,
  thursday: WEEKDAY,
  friday: WEEKDAY,
  saturday: { opens: '09:00', closes: '15:00' },
  sunday: null,
};

describe('formatOpeningHours', () => {
  it('groups consecutive days with the same hours', () => {
    expect(formatOpeningHours(office)).toEqual([
      { days: 'E hënë – e premte', time: '09:00–17:00' },
      { days: 'E shtunë', time: '09:00–15:00' },
      { days: 'E diel', time: 'Mbyllur' },
    ]);
  });

  it('does not merge equal hours that are not consecutive', () => {
    const split: WeeklyHours = { ...office, wednesday: null };
    expect(formatOpeningHours(split).map((line) => line.days)).toEqual([
      'E hënë – e martë',
      'E mërkurë',
      'E enjte – e premte',
      'E shtunë',
      'E diel',
    ]);
  });
});

describe('toOpeningHoursSpecification', () => {
  it('lists open days by hours and leaves closed days out', () => {
    expect(toOpeningHoursSpecification(office)).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '09:00', closes: '15:00' },
    ]);
  });
});
