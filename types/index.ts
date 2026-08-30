export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'RETARD';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classLevel: string;
  parentName: string;
  parentPhone: string;
}

export type AttendanceRecord = Record<string, AttendanceStatus>;

export interface ClassStats {
  total: number;
  present: number;
  absent: number;
  retard: number;
  attendanceRate: number;
}
