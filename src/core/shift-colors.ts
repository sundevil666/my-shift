import type { ShiftCode } from 'src/models/app';

export type ShiftAtmosphere = 'shift-1' | 'shift-2' | 'shift-3' | 'off';

export const shiftColors: Record<ShiftAtmosphere, string> = {
  'shift-1': '#f2c230',
  'shift-2': '#1677d2',
  'shift-3': '#7046c4',
  off: '#718096',
};

export function colorForShift(code: ShiftCode): string {
  return shiftColors[code in shiftColors ? (code as ShiftAtmosphere) : 'off'];
}
