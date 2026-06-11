import type { ShiftCode } from 'src/models/app';

export type ShiftAtmosphere = 'shift-1' | 'shift-2' | 'shift-3' | 'off';

export const shiftColors: Record<ShiftAtmosphere, string> = {
  'shift-1': '#f5a623',
  'shift-2': '#2f8fe5',
  'shift-3': '#6957d9',
  off: '#43a66f',
};

export function colorForShift(code: ShiftCode): string {
  return shiftColors[code in shiftColors ? (code as ShiftAtmosphere) : 'off'];
}
