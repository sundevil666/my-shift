import { describe, expect, it } from 'vitest';
import { colorForShift } from './shift-colors';
import { matchesSearch, normalizeSearch } from './search';

describe('search and shift colors', () => {
  it('normalizes casing, diacritics, Cyrillic д and punctuation', () => {
    expect(normalizeSearch(' Žďár / Д-12 ')).toBe('zdard12');
  });

  it('matches normalized substrings', () => {
    expect(matchesSearch('Čermáň Kostolná', 'cerman')).toBe(true);
    expect(matchesSearch('Night shift', 'day')).toBe(false);
  });

  it('falls back to the off color for custom shift ids', () => {
    expect(colorForShift('shift-2')).toBe('#1677d2');
    expect(colorForShift('custom-shift')).toBe('#718096');
  });
});
