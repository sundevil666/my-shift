import type { ShiftDefinition, UserData } from 'src/models/app';

const today = new Date().toISOString().slice(0, 10);

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
  schemaVersion: 1,
  shifts: structuredClone(dhlDefaultShifts),
  pattern: {
    id: 'default',
    name: '3 + 1',
    startDate: today,
    sequence: ['shift-1', 'shift-2', 'shift-3', 'off'],
  },
  transport: {
    mode: 'bus',
    preparationMinutes: 30,
    carTravelMinutes: 25,
  },
  reminders: {
    enabled: true,
    beforeDepartureMinutes: 60,
    beforeShiftMinutes: 15,
  },
  settings: {
    locale: 'ru-RU',
    theme: 'system',
    sleepHours: 8,
    workplaceType: 'dhl',
    workplaceName: 'DHL',
  },
};
