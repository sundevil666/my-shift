import type { ShiftDefinition, UserData, WorkProfile } from 'src/models/app';

export const dhlDefaultShifts: ShiftDefinition[] = [
  {
    id: 'shift-1',
    name: 'First shift',
    nameKey: 'shifts.first',
    startTime: '06:00',
    endTime: '14:00',
    departureTime: '05:07',
    wakeTime: '04:37',
    color: '#f4b942',
  },
  {
    id: 'shift-2',
    name: 'Second shift',
    nameKey: 'shifts.second',
    startTime: '14:00',
    endTime: '22:00',
    departureTime: '13:07',
    wakeTime: '12:37',
    color: '#4e9fef',
  },
  {
    id: 'shift-3',
    name: 'Night shift',
    nameKey: 'shifts.third',
    startTime: '22:00',
    endTime: '06:00',
    departureTime: '21:07',
    wakeTime: '20:37',
    color: '#7758d6',
  },
];

export const defaultUserData: UserData = {
  schemaVersion: 2,
  onboardingCompleted: false,
  activeWorkProfileId: 'dhl-default',
  workProfiles: [],
  settings: {
    locale: 'ru-RU',
    theme: 'system',
    sleepHours: 8,
    workplaceType: 'dhl',
    workplaceName: 'DHL',
  },
};

export function createDhlWorkProfile(): WorkProfile {
  return {
    id: 'dhl-default',
    workplaceType: 'dhl',
    workplaceName: 'DHL',
    shifts: structuredClone(dhlDefaultShifts),
    pattern: {
      id: 'dhl-default',
      name: 'DHL',
      startDate: mondayKey(new Date()),
      sequence: ['shift-1', 'shift-3', 'shift-2'],
    },
    transport: {
      mode: 'bus',
      alarmBeforeReferenceMinutes: 60,
      leaveReminderEnabled: true,
      leaveBeforeReferenceMinutes: 30,
      carTravelMinutes: 30,
      busRouteId: null,
      busStopId: null,
    },
    reminders: {
      enabled: true,
      beforeDepartureMinutes: 30,
      beforeShiftMinutes: 15,
    },
    calendarOverrides: [],
  };
}

function mondayKey(date: Date): string {
  const value = new Date(date);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  return new Intl.DateTimeFormat('en-CA').format(value);
}
