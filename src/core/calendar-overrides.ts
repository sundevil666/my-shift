import type { CalendarOverrideType } from 'src/models/app';

export const overrideColors: Record<CalendarOverrideType, string> = {
  'day-off': '#2e9d62',
  vacation: '#00a6c8',
  'sick-leave': '#c62828',
  'extra-shift': '#f57c00',
  'week-shift': '#512da8',
};
