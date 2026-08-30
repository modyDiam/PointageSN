export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'RETARD';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classLevel: string;
  parentName: string;
  parentPhone: string;
  createdAt?: number;
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

export type AppView = 'DASHBOARD' | 'ATTENDANCE' | 'REGISTER' | 'STUDENTS' | 'REPORTS';

export interface ActivityEvent {
  id: string;
  type: 'SESSION_CLOSED' | 'WHATSAPP_ALERT' | 'STUDENTS_IMPORTED' | 'SETTINGS_UPDATED';
  title: string;
  description: string;
  timestamp: number;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'neutral';
}
