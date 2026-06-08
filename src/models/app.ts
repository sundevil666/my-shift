export type Locale = 'en-US' | 'ru-RU' | 'uk-UA' | 'sk-SK';
export type ThemeMode = 'light' | 'dark' | 'system';
export type TransportMode = 'bus' | 'car';
export type WorkplaceType = 'dhl' | 'custom';
export type ShiftCode = string;

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
  preparationMinutes: number;
  carTravelMinutes: number;
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
  schemaVersion: 1;
  shifts: ShiftDefinition[];
  pattern: SchedulePattern;
  transport: TransportSettings;
  reminders: ReminderSettings;
  settings: AppSettings;
}
