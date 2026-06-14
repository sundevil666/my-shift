import { describe, expect, it } from 'vitest';
import { defaultUserData } from 'src/core/defaults';
import { migrateUserData, parseMigration, serializeMigration } from './data-migration';

describe('data migration', () => {
  it('adds privacy defaults to existing schema v2 data', () => {
    const old = structuredClone(defaultUserData) as unknown as {
      settings: Record<string, unknown>;
    };
    delete old.settings.cloudPushConsent;
    expect(migrateUserData(old)?.settings.cloudPushConsent).toBe(false);
  });

  it('round-trips a domain migration export', () => {
    const data = structuredClone(defaultUserData);
    data.onboardingCompleted = true;
    expect(parseMigration(serializeMigration(data))).toEqual(data);
  });

  it('rejects unrelated JSON', () => {
    expect(parseMigration('{"data":{}}')).toBeNull();
  });
});
