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
} from "@/types";
import {
  generateDirectionReport,
  DEFAULT_ABSENT_TEMPLATE,
  DEFAULT_RETARD_TEMPLATE,
} from "@/utils/whatsapp";
import { Toast } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";
import { StatsSummaryBar } from "@/components/StatsSummaryBar";
import { StudentListTable } from "@/components/StudentListTable";
import { SummaryModal } from "@/components/SummaryModal";
import { ImportModal } from "@/components/ImportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { MonthlyRegisterView } from "@/components/MonthlyRegisterView";
import { Copy, Users, CheckCheck } from "lucide-react";

const STORAGE_KEY_STUDENTS = "pointagesn_students_v3";
const STORAGE_KEY_ATTENDANCE = "pointagesn_attendance_v3";
const STORAGE_KEY_SETTINGS = "pointagesn_settings_v3";
const STORAGE_KEY_HISTORY = "pointagesn_history_v3";

const TIME_SLOTS = ["08h - 12h", "14h - 18h", "08h - 14h"] as const;

export default function PointageSNApp() {
  // Navigation View: "DAILY" (Pointage du jour) or "MONTHLY" (Registre du mois)
  const [activeView, setActiveView] = useState<"DAILY" | "MONTHLY">("DAILY");

  // Students & Classes
  const [students, setStudents] = useState<Student[]>(defaultMockStudents);
  const [selectedClass, setSelectedClass] = useState<string>("6e A");
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [historySessions, setHistorySessions] = useState<AttendanceSession[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    return Array.from(classSet);
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

  // Filtered students for selected class & search
  const currentClassStudents = useMemo(() => {
    return students.filter((s) => {
      const inClass = s.classLevel === selectedClass;
      if (!inClass) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const parent = s.parentName.toLowerCase();
      return fullName.includes(q) || parent.includes(q);
    });
  }, [students, selectedClass, searchQuery]);

  // Live stats for selected class (independent of search filter for accuracy)
  const classStats: ClassStats = useMemo(() => {
    const allStudentsInClass = students.filter((s) => s.classLevel === selectedClass);
    const total = allStudentsInClass.length;
    let present = 0;
    let absent = 0;
    let retard = 0;

    allStudentsInClass.forEach((s) => {
      const status = attendance[s.id] || "PRESENT";
      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "RETARD") retard++;
    });

    const attendanceRate =
      total > 0 ? Math.round(((present + retard) / total) * 100) : 100;
    return { total, present, absent, retard, attendanceRate };
  }, [students, selectedClass, attendance]);

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
      showToast("Rapport de séance copié & archivé dans le registre ! 📋", "success");
    } catch (err) {
      console.error(err);
      showToast("Séance enregistrée dans le registre !", "info");
    }

    setIsSummaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* Toast */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}

      {/* HEADER PROFESSIONNEL SAAS */}
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        schoolName={settings.schoolName}
        selectedSlot={selectedSlot}
        onSlotChange={setSelectedSlot}
        timeSlots={TIME_SLOTS}
        currentDateFormatted={currentDateFormatted}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:px-6 space-y-3.5">
        {activeView === "DAILY" ? (
          <>
            {/* Class Selection Navigation Bar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
                {availableClasses.map((cls) => {
                  const isSelected = selectedClass === cls;
                  const count = students.filter((s) => s.classLevel === cls).length;

                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                        isSelected
                          ? "bg-navy-900 text-white shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span>Classe {cls}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
                <span>Session active : <strong className="text-slate-700">{settings.schoolName}</strong></span>
              </div>
            </div>

            {/* LIVE KPI & SEARCH BAR */}
            <StatsSummaryBar
              stats={classStats}
              onMarkAllPresent={handleMarkAllClassPresent}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* STUDENT ATTENDANCE TABLE & CARDS */}
            <StudentListTable
              students={currentClassStudents}
              attendance={attendance}
              onStatusChange={handleStatusChange}
              schoolName={settings.schoolName}
              absentTemplate={settings.absentTemplate}
              retardTemplate={settings.retardTemplate}
            />

            {/* STICKY BOTTOM ACTIONS */}
            <div className="sticky bottom-3 z-30 pt-2">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-modal flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600 hidden sm:flex items-center gap-2">
                  <span className="font-bold text-slate-900">Synthèse {selectedClass} :</span>
                  <span className="text-emerald-700 font-semibold">{classStats.present} présents</span>
                  <span>•</span>
                  <span className="text-rose-700 font-semibold">{classStats.absent} absents</span>
                  <span>•</span>
                  <span className="text-amber-700 font-semibold">{classStats.retard} retards</span>
                </div>

                <button
                  type="button"
                  onClick={handleCloseAndCopyReport}
                  className="w-full sm:w-auto ml-auto px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Clôturer la séance & Copier le rapport</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* MONTHLY REGISTER VIEW */
          <MonthlyRegisterView
            students={students}
            availableClasses={availableClasses}
            historySessions={historySessions}
            onResetMonthlyHistory={handleResetMonthlyHistory}
            onShowToast={showToast}
            schoolName={settings.schoolName}
          />
        )}
      </main>

      {/* MODALS */}
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
