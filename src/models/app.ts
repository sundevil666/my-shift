export type Locale = 'en-US' | 'ru-RU' | 'uk-UA' | 'sk-SK';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TransportMode = 'bus' | 'car';
export type WorkplaceType = 'dhl' | 'custom';
export type ShiftCode = string;

export interface BusStop {
  id: string;
  name: string;
  times: Record<string, string>;
}

export interface BusRoute {
  id: string;
  code: string;
  name: string;
  stops: BusStop[];
}

export interface ShiftDefinition {
  id: string;
  name: string;
  nameKey?: string;
  startTime: string;
  endTime: string;
  departureTime: string;
  wakeTime: string;
  color: string;
}

export interface SchedulePattern {
  id: string;
  name: string;
  startDate: string;
  sequence: ShiftCode[];
}

export interface TransportSettings {
  mode: TransportMode;
  alarmBeforeReferenceMinutes: number;
  leaveReminderEnabled: boolean;
  leaveBeforeReferenceMinutes: number;
  carTravelMinutes: number;
  busRouteId: string | null;
  busStopId: string | null;
}

export interface ReminderSettings {
  enabled: boolean;
  beforeDepartureMinutes: number;
  beforeShiftMinutes: number;
}

export interface AppSettings {
  locale: Locale;
  theme: ThemeMode;
  sleepHours: number;
  workplaceType: WorkplaceType;
  workplaceName: string;
}

export interface UserData {
  schemaVersion: 2;
  onboardingCompleted: boolean;
  activeWorkProfileId: string;
  workProfiles: WorkProfile[];
  settings: AppSettings;
}

export interface WorkProfile {
  id: string;
  workplaceType: WorkplaceType;
  workplaceName: string;
  shifts: ShiftDefinition[];
  pattern: SchedulePattern;
  transport: TransportSettings;
  reminders: ReminderSettings;
  calendarOverrides: CalendarOverride[];
}

export type CalendarOverrideType = 'day-off' | 'vacation' | 'extra-shift';

export interface CalendarOverride {
  id: string;
  type: CalendarOverrideType;
  startDate: string;
  endDate: string;
  shiftId?: string;
}
