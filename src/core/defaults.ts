import type { ShiftDefinition, UserData, WorkProfile } from 'src/models/app';
import { shiftColors } from 'src/core/shift-colors';

export const dhlDefaultShifts: ShiftDefinition[] = [
  {
    id: 'shift-1',
    name: 'First shift',
    nameKey: 'shifts.first',
    startTime: '06:00',
    endTime: '14:00',
    departureTime: '05:07',
    wakeTime: '04:37',
    color: shiftColors['shift-1'],
  },
  {
    id: 'shift-2',
    name: 'Second shift',
    nameKey: 'shifts.second',
    startTime: '14:00',
    endTime: '22:00',
    departureTime: '13:07',
    wakeTime: '12:37',
    color: shiftColors['shift-2'],
  },
  {
    id: 'shift-3',
    name: 'Night shift',
    nameKey: 'shifts.third',
    startTime: '22:00',
    endTime: '06:00',
    departureTime: '21:07',
    wakeTime: '20:37',
    color: shiftColors['shift-3'],
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
  const today = dateKey(new Date());
  return {
    id: 'dhl-default',
    workplaceType: 'dhl',
    workplaceName: 'DHL',
    employmentStartDate: today,
    trackingStartDate: today,
    shifts: structuredClone(dhlDefaultShifts),
    pattern: {
      id: 'dhl-default',
      name: 'DHL',
      startDate: mondayKey(new Date()),
      sequence: ['shift-1', 'shift-3', 'shift-2'],
    },
    transport: {
      mode: 'bus',
      alarmEnabled: true,
      alarmBeforeReferenceMinutes: 60,
      leaveReminderEnabled: true,
      leaveBeforeReferenceMinutes: 30,
      carTravelMinutes: 30,
      busRouteId: null,
      busStopId: null,
    },
    reminders: {
      enabled: true,
      shiftStartEnabled: true,
      shiftStartBeforeMinutes: 10,
      firstBreakEnabled: true,
      firstBreakBeforeMinutes: 5,
      shiftEndEnabled: true,
      shiftEndBeforeMinutes: 30,
      beforeDepartureMinutes: 30,
      beforeShiftMinutes: 15,
    },
    calendarOverrides: [],
  };
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mondayKey(date: Date): string {
  const value = new Date(date);
  const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
  return new Intl.DateTimeFormat('en-CA').format(value);
}
