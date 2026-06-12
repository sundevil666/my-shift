import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { computed, ref, toRaw, watch } from 'vue';
import { createDhlWorkProfile, defaultUserData } from 'src/core/defaults';
import { resolvedShiftCodeForDate } from 'src/core/schedule';
import { browserStorage } from 'src/services/storage/storage';
import type {
  Locale,
  CalendarOverride,
  ThemeMode,
  TransportMode,
  UserData,
  WorkProfile,
} from 'src/models/app';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useAppStore = defineStore('app', () => {
  const data = ref<UserData>(structuredClone(defaultUserData));
  const initialized = ref(false);
  const saveStatus = ref<SaveStatus>('idle');
  let atmosphereTimer: number | undefined;
  let saveTimer: number | undefined;
  let pendingSave: UserData | undefined;
  let initializationStarted = false;
  const activeProfile = computed<WorkProfile>(() => {
    const profile = data.value.workProfiles.find(
      (item) => item.id === data.value.activeWorkProfileId,
    );
    return profile ?? data.value.workProfiles[0] ?? createDhlWorkProfile();
  });
  const shifts = computed(() => activeProfile.value.shifts);
  const pattern = computed(() => activeProfile.value.pattern);

  function initialize() {
    if (initializationStarted) return;
    initializationStarted = true;

    const saved = browserStorage.load();
    if (saved && saved.schemaVersion === 2) {
      data.value = saved as unknown as UserData;
      data.value.workProfiles.forEach((profile) => {
        const today = localDateKey(new Date());
        profile.calendarOverrides ??= [];
        profile.employmentStartDate ??= today;
        profile.trackingStartDate ??= today;
        profile.transport.alarmEnabled ??= true;
        profile.reminders.shiftStartEnabled ??= true;
        profile.reminders.firstBreakEnabled ??= true;
        profile.reminders.shiftEndEnabled ??= true;
      });
    } else if (saved && saved.schemaVersion === 1) {
      data.value = migrateV1(saved as unknown as Record<string, unknown>);
    }
    applyTheme(data.value.settings.theme);
    applyShiftAtmosphere();
    scheduleAtmosphereRefresh();
    window.addEventListener('pagehide', flushSave);
    initialized.value = true;
  }

  function completeOnboarding(options: {
    transportMode: TransportMode;
    currentShiftId: string;
    busRouteId: string | null;
    busStopId: string | null;
  }) {
    const profile = createDhlWorkProfile();
    profile.transport.mode = options.transportMode;
    profile.transport.busRouteId = options.busRouteId;
    profile.transport.busStopId = options.busStopId;
    rotatePattern(profile, options.currentShiftId);
    data.value.workProfiles = [profile];
    data.value.activeWorkProfileId = profile.id;
    data.value.onboardingCompleted = true;
    applyShiftAtmosphere();
  }

  function setCurrentShift(code: string) {
    rotatePattern(activeProfile.value, code);
    applyShiftAtmosphere();
  }

  function setTransportMode(mode: TransportMode) {
    activeProfile.value.transport.mode = mode;
  }

  function setLocale(locale: Locale) {
    data.value.settings.locale = locale;
  }

  function setTheme(theme: ThemeMode) {
    data.value.settings.theme = theme;
    applyTheme(theme);
  }

  function saveCalendarOverride(override: CalendarOverride) {
    const overrides = activeProfile.value.calendarOverrides;
    const index = overrides.findIndex((item) => item.id === override.id);
    if (index >= 0) overrides[index] = override;
    else overrides.push(override);
    applyShiftAtmosphere();
  }

  function removeCalendarOverride(id: string) {
    activeProfile.value.calendarOverrides = activeProfile.value.calendarOverrides.filter(
      (item) => item.id !== id,
    );
    applyShiftAtmosphere();
  }

  function replaceCalendarOverrides(
    override: CalendarOverride,
    replacedOverrideIds: string[],
  ) {
    const replacedIds = new Set(replacedOverrideIds);
    activeProfile.value.calendarOverrides = [
      ...activeProfile.value.calendarOverrides.filter((item) => !replacedIds.has(item.id)),
      override,
    ];
    applyShiftAtmosphere();
  }

  function applyTheme(theme: ThemeMode) {
    Dark.set(theme === 'system' ? 'auto' : theme === 'dark');
  }

  function applyShiftAtmosphere(date = new Date()) {
    const shiftCode = resolvedShiftCodeForDate(
      date,
      activeProfile.value.pattern,
      activeProfile.value.calendarOverrides,
    );
    document.body.dataset.shiftAtmosphere = shiftCode;
  }

  function scheduleAtmosphereRefresh() {
    if (atmosphereTimer) window.clearTimeout(atmosphereTimer);
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 1, 0);
    atmosphereTimer = window.setTimeout(() => {
      applyShiftAtmosphere();
      scheduleAtmosphereRefresh();
    }, nextDay.getTime() - now.getTime());
  }

  function resetApplication() {
    pendingSave = undefined;
    if (saveTimer) window.clearTimeout(saveTimer);
    browserStorage.clear();
    window.location.reload();
  }

  function flushSave() {
    if (!pendingSave) return;
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = undefined;
    const result = browserStorage.save(pendingSave);
    pendingSave = undefined;
    saveStatus.value = result.ok ? 'saved' : 'error';
  }

  watch(
    data,
    (value) => {
      if (!initialized.value) return;

      saveStatus.value = 'saving';
      pendingSave = structuredClone(toRaw(value));
      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(flushSave, 250);
    },
    { deep: true },
  );

  return {
    data,
    activeProfile,
    shifts,
    pattern,
    initialized,
    saveStatus,
    initialize,
    completeOnboarding,
    setCurrentShift,
    setTransportMode,
    setLocale,
    setTheme,
    saveCalendarOverride,
    removeCalendarOverride,
    replaceCalendarOverrides,
    applyShiftAtmosphere,
    resetApplication,
  };
});

function rotatePattern(profile: WorkProfile, code: string) {
  const rotation = ['shift-1', 'shift-3', 'shift-2'];
  const index = rotation.indexOf(code);
  if (index < 0) return;
  profile.pattern.sequence = [...rotation.slice(index), ...rotation.slice(0, index)];
  profile.pattern.startDate = mondayKey(new Date());
}

function mondayKey(date: Date): string {
  const value = new Date(date);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  return new Intl.DateTimeFormat('en-CA').format(value);
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function migrateV1(saved: Record<string, unknown>): UserData {
  const result = structuredClone(defaultUserData);
  const oldSettings = (saved.settings ?? {}) as Record<string, unknown>;
  result.settings = {
    ...result.settings,
    locale: (oldSettings.locale as Locale) ?? result.settings.locale,
    theme: (oldSettings.theme as ThemeMode) ?? result.settings.theme,
    sleepHours: Number(oldSettings.sleepHours ?? result.settings.sleepHours),
  };
  return result;
}
