import { describe, expect, it } from 'vitest';
import { normalizeError } from './error-reporting';

describe('normalizeError', () => {
  it('keeps useful Error fields', () => {
    const result = normalizeError(new TypeError('broken'));
    expect(result.name).toBe('TypeError');
    expect(result.message).toBe('broken');
    expect(result.stack).toContain('TypeError: broken');
  });

  it('handles strings and circular values', () => {
    expect(normalizeError('broken').message).toBe('broken');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(normalizeError(circular).message).toBe('[object Object]');
  });
});
