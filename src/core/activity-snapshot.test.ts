import { describe, expect, it } from 'vitest';
import { createDhlWorkProfile, defaultUserData } from 'src/core/defaults';
import { buildActivitySnapshot } from 'src/core/activity-snapshot';

describe('buildActivitySnapshot', () => {
  it('expands the rotation into parseable activity days', () => {
    const profile = createDhlWorkProfile();
    profile.pattern.startDate = '2026-08-10';
    profile.pattern.sequence = ['shift-3'];
    const data = structuredClone(defaultUserData);
    data.activeWorkProfileId = profile.id;
    data.workProfiles = [profile];
    const snapshot = buildActivitySnapshot(data, new Date(2026, 7, 15, 12));
    const monday = snapshot.days.find((day) => day.date === '2026-08-10');

    expect(snapshot.days).toHaveLength(90);
    expect(monday?.dayType).toBe('workday');
    expect(monday?.shift).toMatchObject({ id: 'shift-3', isNightShift: true });
    expect(monday?.workBreaks[0]).toMatchObject({ durationMinutes: 30, source: 'estimated' });
    expect(monday?.recommendedLearningWindows).toHaveLength(2);
  });

  it('marks weekends and explicit absences as non-working days', () => {
    const profile = createDhlWorkProfile();
    profile.pattern.startDate = '2026-08-10';
    profile.calendarOverrides.push({ id: 'vacation', type: 'vacation', startDate: '2026-08-12', endDate: '2026-08-12' });
    const data = structuredClone(defaultUserData);
    data.activeWorkProfileId = profile.id;
    data.workProfiles = [profile];
    const snapshot = buildActivitySnapshot(data, new Date(2026, 7, 15, 12));

    expect(snapshot.days.find((day) => day.date === '2026-08-12')?.dayType).toBe('vacation');
    expect(snapshot.days.find((day) => day.date === '2026-08-15')?.dayType).toBe('day_off');
  });
});
