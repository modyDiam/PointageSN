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

export interface SchoolSettings {
  schoolName: string;
  absentTemplate: string;
  retardTemplate: string;
}

export interface AttendanceSession {
  id: string;
  date: string;
  timestamp: number;
  classLevel: string;
  slot: string;
  records: Record<string, AttendanceStatus>;
}

export interface StudentMonthlyStat {
  student: Student;
  absentCount: number;
  retardCount: number;
  presentCount: number;
  totalSessions: number;
}
