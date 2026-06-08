import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { computed, ref, watch } from 'vue';
import { defaultUserData, dhlDefaultShifts } from 'src/core/defaults';
import { browserStorage } from 'src/services/storage/storage';
import type { Locale, ThemeMode, UserData, WorkplaceType } from 'src/models/app';

export const useAppStore = defineStore('app', () => {
  const data = ref<UserData>(structuredClone(defaultUserData));
  const initialized = ref(false);

  const shifts = computed(() => data.value.shifts);
  const pattern = computed(() => data.value.pattern);

  function initialize() {
    const saved = browserStorage.load();
    if (saved?.schemaVersion === 1) {
      data.value = saved;
      data.value.settings.workplaceType ??= 'dhl';
      data.value.settings.workplaceName ??= 'DHL';
      data.value.shifts.forEach((shift, index) => {
        shift.name ??= `Shift ${index + 1}`;
        shift.wakeTime ??= subtractMinutes(shift.departureTime, data.value.transport.preparationMinutes);
      });
    }
    applyTheme(data.value.settings.theme);
    initialized.value = true;
  }

  function applyTheme(theme: ThemeMode) {
    Dark.set(theme === 'system' ? 'auto' : theme === 'dark');
  }

  function setLocale(locale: Locale) {
    data.value.settings.locale = locale;
  }

  function setTheme(theme: ThemeMode) {
    data.value.settings.theme = theme;
    applyTheme(theme);
  }

  function setWorkplace(type: WorkplaceType) {
    data.value.settings.workplaceType = type;
    if (type === 'dhl') {
      data.value.settings.workplaceName = 'DHL';
      resetDhlSchedule();
      return;
    }
    data.value.settings.workplaceName = '';
    const firstShift = createShift(1);
    data.value.shifts = [firstShift];
    data.value.pattern = {
      id: 'custom',
      name: 'My schedule',
      startDate: new Intl.DateTimeFormat('en-CA').format(new Date()),
      sequence: [firstShift.id, 'off'],
    };
  }

  function resetDhlSchedule() {
    data.value.shifts = structuredClone(dhlDefaultShifts);
    data.value.pattern = {
      id: 'dhl-default',
      name: 'DHL',
      startDate: new Intl.DateTimeFormat('en-CA').format(new Date()),
      sequence: ['shift-1', 'shift-3', 'shift-2'],
    };
  }

  function addShift() {
    const shift = createShift(data.value.shifts.length + 1);
    data.value.shifts.push(shift);
    data.value.pattern.sequence.push(shift.id);
  }

  function removeShift(id: string) {
    if (data.value.shifts.length === 1) return;
    data.value.shifts = data.value.shifts.filter((shift) => shift.id !== id);
    data.value.pattern.sequence = data.value.pattern.sequence.filter((code) => code !== id);
    if (!data.value.pattern.sequence.length) data.value.pattern.sequence = ['off'];
  }

  watch(
    data,
    (value) => {
      if (initialized.value) browserStorage.save(value);
    },
    { deep: true },
  );

  return {
    data,
    shifts,
    pattern,
    initialized,
    initialize,
    setLocale,
    setTheme,
    setWorkplace,
    resetDhlSchedule,
    addShift,
    removeShift,
  };
});

function subtractMinutes(time: string, minutes: number): string {
  const [hours = 0, mins = 0] = time.split(':').map(Number);
  const total = (hours * 60 + mins - minutes + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function createShift(index: number) {
  return {
    id: `shift-${Date.now()}-${index}`,
    name: `Shift ${index}`,
    startTime: '08:00',
    endTime: '16:00',
    departureTime: '07:15',
    wakeTime: '06:30',
    color: ['#f4b942', '#4e9fef', '#7758d6', '#36a269', '#e76f51'][(index - 1) % 5]!,
  };
}
