import { describe, expect, it } from 'vitest';
import { parsePhone } from './phone';

describe('parsePhone — Kosovo', () => {
  it.each([
    ['044 123 456', '+38344123456', '+383 44 123 456'],
    ['049-123-456', '+38349123456', '+383 49 123 456'],
    ['+383 45 123 456', '+38345123456', '+383 45 123 456'],
    ['00383 43 123 456', '+38343123456', '+383 43 123 456'],
    ['+383 044 123 456', '+38344123456', '+383 44 123 456'],
    ['038 123 456', '+38338123456', '+383 38 123 456'],
    ['(0290) 12 345', '+38329012345', '+383 29 012 345'],
    ['44123456', '+38344123456', '+383 44 123 456'],
  ])('accepts %s', (input, e164, display) => {
    expect(parsePhone(input)).toEqual({ ok: true, e164, display });
  });

  it('reports a wrong length', () => {
    expect(parsePhone('044 123 45')).toEqual({ ok: false, error: 'kosovoLength' });
    expect(parsePhone('+383 44 123 4567')).toEqual({ ok: false, error: 'kosovoLength' });
  });

  it('reports a prefix that no Kosovo number uses', () => {
    expect(parsePhone('051 123 456')).toEqual({ ok: false, error: 'kosovoPrefix' });
    expect(parsePhone('+383 12 345 678')).toEqual({ ok: false, error: 'kosovoPrefix' });
  });
});

describe('parsePhone — other input', () => {
  it('accepts international numbers from abroad', () => {
    expect(parsePhone('+49 170 1234567')).toEqual({ ok: true, e164: '+491701234567', display: '+491701234567' });
    expect(parsePhone('0041 79 123 45 67')).toEqual({ ok: true, e164: '+41791234567', display: '+41791234567' });
  });

  it('rejects empty, malformed and ambiguous input', () => {
    expect(parsePhone('   ')).toEqual({ ok: false, error: 'empty' });
    expect(parsePhone('044 12a 456')).toEqual({ ok: false, error: 'characters' });
    expect(parsePhone('044+123')).toEqual({ ok: false, error: 'characters' });
    expect(parsePhone('123 456')).toEqual({ ok: false, error: 'missingPrefix' });
    expect(parsePhone('+49 12')).toEqual({ ok: false, error: 'internationalLength' });
    expect(parsePhone('+1234567890123456')).toEqual({ ok: false, error: 'internationalLength' });
  });
});
