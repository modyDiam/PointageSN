"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  mockStudents as defaultMockStudents,
  DEFAULT_SCHOOL_NAME,
} from "@/data/mockStudents";
import {
  Student,
  AttendanceStatus,
  AttendanceRecord,
  ClassStats,
  SchoolSettings,
  AttendanceSession,
  AppView,
} from "@/types";
import {
  generateDirectionReport,
  DEFAULT_ABSENT_TEMPLATE,
  DEFAULT_RETARD_TEMPLATE,
} from "@/utils/whatsapp";
import { Toast } from "@/components/Toast";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardView } from "@/components/DashboardView";
import { AttendanceView } from "@/components/AttendanceView";
import { StudentsManagementView } from "@/components/StudentsManagementView";
import { StudentFormModal } from "@/components/StudentFormModal";
import { SummaryModal } from "@/components/SummaryModal";
import { ImportModal } from "@/components/ImportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { MonthlyRegisterView } from "@/components/MonthlyRegisterView";
import { ReportsManagementView } from "@/components/ReportsManagementView";
import { ArrowLeft } from "lucide-react";

const STORAGE_KEY_STUDENTS = "pointagesn_students_v3";
const STORAGE_KEY_ATTENDANCE = "pointagesn_attendance_v3";
const STORAGE_KEY_SETTINGS = "pointagesn_settings_v3";
const STORAGE_KEY_HISTORY = "pointagesn_history_v3";

const TIME_SLOTS = ["08h - 12h", "14h - 18h", "08h - 14h"] as const;

export default function PointageSNApp() {
  // Navigation View: "DASHBOARD" | "ATTENDANCE" | "REGISTER" | "STUDENTS"
  const [activeView, setActiveView] = useState<AppView>("DASHBOARD");

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Students & Classes
  const [students, setStudents] = useState<Student[]>(defaultMockStudents);
  const [selectedClass, setSelectedClass] = useState<string>("6e A");
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [historySessions, setHistorySessions] = useState<AttendanceSession[]>([]);

  // Student Form Modal state
  const [isStudentFormOpen, setIsStudentFormOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Settings
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: DEFAULT_SCHOOL_NAME,
    absentTemplate: DEFAULT_ABSENT_TEMPLATE,
    retardTemplate: DEFAULT_RETARD_TEMPLATE,
  });

  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState<boolean>(false);
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("");

  // Modals state
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Toast state
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  // Initialize attendance with default 'PRESENT' for all students
  const getDefaultAttendance = (currentStudents: Student[]): AttendanceRecord => {
    const initial: AttendanceRecord = {};
    currentStudents.forEach((student) => {
      initial[student.id] = "PRESENT";
    });
    return initial;
  };

  // Dynamic available classes from students
  const availableClasses = useMemo(() => {
    const classSet = new Set(students.map((s) => s.classLevel));
    const list = Array.from(classSet);
    return list.length > 0 ? list : ["6e A", "3e A", "Tle S2"];
  }, [students]);

  // Date formatting
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      setCurrentDateFormatted(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
    };
    updateDate();
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      // 1. Students
      const savedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
      let loadedStudents = defaultMockStudents;
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedStudents = parsed;
            setStudents(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Settings
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
        } catch (e) {
          console.error(e);
        }
      }

      // 3. Attendance
      const savedAttendance = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      if (savedAttendance) {
        const parsed = JSON.parse(savedAttendance);
        const merged: AttendanceRecord = getDefaultAttendance(loadedStudents);
        Object.assign(merged, parsed);
        setAttendance(merged);
      } else {
        setAttendance(getDefaultAttendance(loadedStudents));
      }

      // 4. History sessions
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            setHistorySessions(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Set initial selected class
      if (loadedStudents.length > 0) {
        setSelectedClass(loadedStudents[0].classLevel);
      }
    } catch (e) {
      console.error("Failed to load from storage:", e);
    } finally {
      setIsLoadedFromStorage(true);
    }
  }, []);

  // Save attendance to localStorage
  useEffect(() => {
    if (!isLoadedFromStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance, isLoadedFromStorage]);

  // Save students to localStorage
  const handleStudentsImported = (imported: Student[]) => {
    setStudents(imported);
    const newAttendance = getDefaultAttendance(imported);
    setAttendance(newAttendance);
    if (imported.length > 0) {
      setSelectedClass(imported[0].classLevel);
    }
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(imported));
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(newAttendance));
    } catch (e) {
      console.error(e);
    }
  };

  // Restore demo students
  const handleRestoreDefaultStudents = () => {
    setStudents(defaultMockStudents);
    const newAttendance = getDefaultAttendance(defaultMockStudents);
    setAttendance(newAttendance);
    setSelectedClass("6e A");
    try {
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(newAttendance));
    } catch (e) {
      console.error(e);
    }
  };

  // Add or Edit Single Student
  const handleSaveStudent = (data: Omit<Student, "id"> & { id?: string }) => {
    if (data.id) {
      // Edit existing
      setStudents((prev) => {
        const next = prev.map((s) =>
          s.id === data.id
            ? {
                ...s,
                firstName: data.firstName,
                lastName: data.lastName,
                classLevel: data.classLevel,
                parentName: data.parentName,
                parentPhone: data.parentPhone,
              }
            : s
        );
        try {
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    } else {
      // Add new
      const newStudent: Student = {
        id: `stu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        firstName: data.firstName,
        lastName: data.lastName,
        classLevel: data.classLevel,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        createdAt: Date.now(),
      };

      setStudents((prev) => {
        const next = [newStudent, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      // Add to attendance with PRESENT
      setAttendance((prev) => ({
        ...prev,
        [newStudent.id]: "PRESENT",
      }));
    }
  };

  // Delete Student
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => {
      const next = prev.filter((s) => s.id !== studentId);
      try {
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setAttendance((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  // Save settings
  const handleSaveSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // Reset monthly history
  const handleResetMonthlyHistory = () => {
    setHistorySessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    setToastInfo({ message, type });
  };

  // Change status of a single student
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  // Mark all in active class as present
  const handleMarkAllClassPresent = () => {
    const classStudents = students.filter((s) => s.classLevel === selectedClass);
    setAttendance((prev) => {
      const next = { ...prev };
      classStudents.forEach((s) => {
        next[s.id] = "PRESENT";
      });
      return next;
    });
    showToast(`Tous marqués Présent (${selectedClass})`, "success");
  };

  // Live global absents and retards for notifications and sidebar
  const { absentCount, retardCount } = useMemo(() => {
    let absents = 0;
    let retards = 0;
    students.forEach((s) => {
      const st = attendance[s.id] || "PRESENT";
      if (st === "ABSENT") absents++;
      else if (st === "RETARD") retards++;
    });
    return { absentCount: absents, retardCount: retards };
  }, [students, attendance]);

  // Jump from Dashboard to specific class call
  const handleSelectClassAndCall = (className: string) => {
    setSelectedClass(className);
    setActiveView("ATTENDANCE");
  };

  // Clôturer & Sauvegarder la séance dans l'historique
  const handleCloseAndCopyReport = async () => {
    const now = new Date();
    const sessionDateFormatted = now.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Record session in history
    const sessionRecord: AttendanceSession = {
      id: `sess-${Date.now()}`,
      date: sessionDateFormatted,
      timestamp: Date.now(),
      classLevel: selectedClass,
      slot: selectedSlot,
      records: { ...attendance },
    };

    setHistorySessions((prev) => {
      const next = [sessionRecord, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    // 2. Generate report & copy to clipboard
    const reportText = generateDirectionReport(
      selectedClass,
      students,
      attendance,
      settings.schoolName,
      sessionDateFormatted
    );

    try {
      await navigator.clipboard.writeText(reportText);
      showToast("Rapport officiel copié & archivé dans le registre ! 📋", "success");
    } catch (err) {
      console.error(err);
      showToast("Séance enregistrée dans le registre !", "info");
    }

    setIsSummaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans selection:bg-navy-900 selection:text-white">
      {/* Toast Notifications */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}

      {/* REDESIGNED SAAS SIDEBAR */}
      <Sidebar
        currentView={activeView}
        onNavigate={setActiveView}
        schoolName={settings.schoolName}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReport={() => setIsSummaryOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        absentCount={absentCount}
        retardCount={retardCount}
        totalStudentsCount={students.length}
      />

      {/* MAIN WRAPPER (With left padding for desktop sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* EXECUTIVE HEADER */}
        <DashboardHeader
          schoolName={settings.schoolName}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          timeSlots={TIME_SLOTS}
          currentDateFormatted={currentDateFormatted}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          students={students}
          attendance={attendance}
          historySessions={historySessions}
          currentView={activeView}
        />

        {/* DYNAMIC VIEW ROUTER */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 sm:px-6 space-y-4">
          
          {/* VIEW 1: DASHBOARD PRINCIPAL */}
          {activeView === "DASHBOARD" && (
            <DashboardView
              students={students}
              availableClasses={availableClasses}
              attendance={attendance}
              historySessions={historySessions}
              schoolName={settings.schoolName}
              selectedSlot={selectedSlot}
              currentDateFormatted={currentDateFormatted}
              onNavigate={setActiveView}
              onSelectClassAndCall={handleSelectClassAndCall}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenReport={() => setIsSummaryOpen(true)}
            />
          )}

          {/* VIEW 2: FAIRE L'APPEL (EXPÉRIENCE POINTAGE) */}
          {activeView === "ATTENDANCE" && (
            <AttendanceView
              students={students}
              availableClasses={availableClasses}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              selectedSlot={selectedSlot}
              currentDateFormatted={currentDateFormatted}
              attendance={attendance}
              onStatusChange={handleStatusChange}
              onMarkAllPresent={handleMarkAllClassPresent}
              onCloseAndCopyReport={handleCloseAndCopyReport}
              onBackToDashboard={() => setActiveView("DASHBOARD")}
              schoolName={settings.schoolName}
              absentTemplate={settings.absentTemplate}
              retardTemplate={settings.retardTemplate}
              onShowToast={showToast}
            />
          )}

          {/* VIEW 3: GESTION DES ÉLÈVES & CLASSES (NOUVEAU MODULE SAAS) */}
          {activeView === "STUDENTS" && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView("DASHBOARD")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl transition shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour au Dashboard</span>
                </button>
              </div>

              <StudentsManagementView
                students={students}
                availableClasses={availableClasses}
                attendance={attendance}
                historySessions={historySessions}
                schoolName={settings.schoolName}
                onOpenAddStudent={() => {
                  setStudentToEdit(null);
                  setIsStudentFormOpen(true);
                }}
                onOpenEditStudent={(st) => {
                  setStudentToEdit(st);
                  setIsStudentFormOpen(true);
                }}
                onDeleteStudent={handleDeleteStudent}
                onOpenImport={() => setIsImportOpen(true)}
                onRestoreDefaults={handleRestoreDefaultStudents}
                onShowToast={showToast}
              />
            </div>
          )}

          {/* VIEW 4: REGISTRE MENSUEL */}
          {activeView === "REGISTER" && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView("DASHBOARD")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl transition shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour au Dashboard</span>
                </button>
              </div>

              <MonthlyRegisterView
                students={students}
                availableClasses={availableClasses}
                historySessions={historySessions}
                onResetMonthlyHistory={handleResetMonthlyHistory}
                onShowToast={showToast}
                schoolName={settings.schoolName}
              />
            </div>
          )}

          {/* VIEW 5: RAPPORTS ADMINISTRATIFS & EXPORT PDF */}
          {activeView === "REPORTS" && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="no-print flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView("DASHBOARD")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl transition shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour au Dashboard</span>
                </button>
              </div>

              <ReportsManagementView
                students={students}
                availableClasses={availableClasses}
                attendance={attendance}
                historySessions={historySessions}
                schoolName={settings.schoolName}
                selectedSlot={selectedSlot}
                currentDateFormatted={currentDateFormatted}
                onShowToast={showToast}
              />
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      <StudentFormModal
        isOpen={isStudentFormOpen}
        onClose={() => {
          setIsStudentFormOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
        availableClasses={availableClasses}
        onSaveStudent={handleSaveStudent}
        onShowToast={showToast}
      />

      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        selectedClass={selectedClass}
        students={students}
        attendance={attendance}
        schoolName={settings.schoolName}
        onShowToast={showToast}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleStudentsImported}
        onRestoreDefaults={handleRestoreDefaultStudents}
        onShowToast={showToast}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onShowToast={showToast}
      />
    </div>
  );
}
