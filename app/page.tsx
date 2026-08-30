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
  generateParentWhatsAppLink,
  formatPhoneDisplay,
  generateDirectionReport,
  DEFAULT_ABSENT_TEMPLATE,
  DEFAULT_RETARD_TEMPLATE,
} from "@/utils/whatsapp";
import { Toast } from "@/components/Toast";
import { SummaryModal } from "@/components/SummaryModal";
import { ImportModal } from "@/components/ImportModal";
import { SettingsModal } from "@/components/SettingsModal";
import { MonthlyRegisterView } from "@/components/MonthlyRegisterView";
import {
  CheckCheck,
  Copy,
  Settings,
  FileSpreadsheet,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Download,
} from "lucide-react";

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

      // Set initial selected class if needed
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

  // Students in selected class
  const currentClassStudents = useMemo(() => {
    return students.filter((s) => s.classLevel === selectedClass);
  }, [students, selectedClass]);

  // Live stats for selected class
  const classStats: ClassStats = useMemo(() => {
    const total = currentClassStudents.length;
    let present = 0;
    let absent = 0;
    let retard = 0;

    currentClassStudents.forEach((s) => {
      const status = attendance[s.id] || "PRESENT";
      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "RETARD") retard++;
    });

    const attendanceRate =
      total > 0 ? Math.round(((present + retard) / total) * 100) : 100;
    return { total, present, absent, retard, attendanceRate };
  }, [currentClassStudents, attendance]);

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
      showToast("Rapport copié & séance enregistrée dans le registre ! 📋", "success");
    } catch (err) {
      console.error(err);
      showToast("Séance enregistrée dans le registre !", "info");
    }

    setIsSummaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}

      {/* HEADER COMPACT (Une seule ligne) */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Gauche : Logo + Switcher de vue [Pointage | Registre] + Onglets de classe */}
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight shrink-0">
              Pointage<span className="text-blue-600">SN</span>
            </span>

            {/* Vue Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveView("DAILY")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                  activeView === "DAILY"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pointage</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("MONTHLY")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                  activeView === "MONTHLY"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Registre</span>
              </button>
            </div>

            {/* Onglets directs de classe (uniquement en vue DAILY) */}
            {activeView === "DAILY" && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 overflow-x-auto max-w-[200px] sm:max-w-none">
                {availableClasses.map((cls) => {
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                        isSelected
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Droite : Date, Créneau & Boutons Modules (Import + Paramètres) */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
            {activeView === "DAILY" && (
              <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-medium">
                <span>{currentDateFormatted}</span>
                <span>•</span>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  aria-label="Sélectionner le créneau horaire"
                  className="bg-transparent text-slate-600 hover:text-slate-900 font-medium cursor-pointer focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bouton Importateur CSV */}
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200 flex items-center gap-1"
              title="Importer des élèves (CSV / Excel)"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline font-semibold">Import</span>
            </button>

            {/* Bouton Paramètres Établissement */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              title="Paramètres de l'école et messages d'alerte"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 space-y-3">
        {activeView === "DAILY" ? (
          <>
            {/* MINI-BARRE DE COMPTEURS */}
            <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-600">
                  Total : <strong className="text-slate-900 font-bold">{classStats.total}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200/60">
                  Présents : {classStats.present}
                </span>
                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold border border-rose-200/60">
                  Absents : {classStats.absent}
                </span>
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60">
                  Retards : {classStats.retard}
                </span>
              </div>

              <button
                type="button"
                onClick={handleMarkAllClassPresent}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition self-start sm:self-auto"
              >
                Tout cocher Présent
              </button>
            </div>

            {/* CARTES ÉLÈVES */}
            <div className="space-y-2">
              {currentClassStudents.map((student) => {
                const status = attendance[student.id] || "PRESENT";
                const whatsappUrl = generateParentWhatsAppLink(
                  student,
                  status,
                  settings.schoolName,
                  settings.absentTemplate,
                  settings.retardTemplate
                );

                return (
                  <div
                    key={student.id}
                    className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    {/* Ligne 1 : Nom et prénom en gras, nom et numéro du parent en gris */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-sm text-slate-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {student.parentName} •{" "}
                        <a
                          href={`tel:+${student.parentPhone}`}
                          className="hover:underline text-slate-600 font-mono"
                        >
                          {formatPhoneDisplay(student.parentPhone)}
                        </a>
                      </div>
                    </div>

                    {/* Ligne 2 : Sélecteur segmenté simple [Présent | Retard | Absent] */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex-1 bg-slate-100 p-0.5 rounded-lg grid grid-cols-3 gap-0.5 border border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "PRESENT")}
                          className={`py-1 text-xs font-semibold rounded-md transition ${
                            status === "PRESENT"
                              ? "bg-emerald-600 text-white font-bold shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "RETARD")}
                          className={`py-1 text-xs font-semibold rounded-md transition ${
                            status === "RETARD"
                              ? "bg-amber-500 text-white font-bold shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Retard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "ABSENT")}
                          className={`py-1 text-xs font-semibold rounded-md transition ${
                            status === "ABSENT"
                              ? "bg-rose-600 text-white font-bold shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Absent
                        </button>
                      </div>

                      {/* Si Absent ou Retard : bouton WhatsApp minimaliste */}
                      {(status === "ABSENT" || status === "RETARD") && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
                        >
                          <span>WhatsApp Parent ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {currentClassStudents.length === 0 && (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                  Aucun élève dans cette classe. Importez une liste via le bouton <strong>Import</strong>.
                </div>
              )}
            </div>

            {/* ACTION PRINCIPALE : Bouton unique fixé en bas */}
            <div className="sticky bottom-4 z-30 pt-2">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 shadow-md flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 hidden sm:block">
                  Classe : <strong className="text-slate-800">{selectedClass}</strong> ({classStats.present} prés., {classStats.absent} abs., {classStats.retard} ret.)
                </div>

                <button
                  type="button"
                  onClick={handleCloseAndCopyReport}
                  className="w-full sm:w-auto ml-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Clôturer & Copier le rapport</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* VUE REGISTRE CUMULÉ DU MOIS */
          <MonthlyRegisterView
            students={students}
            availableClasses={availableClasses}
            historySessions={historySessions}
            onResetMonthlyHistory={handleResetMonthlyHistory}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Modale de Rapport de séance */}
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        selectedClass={selectedClass}
        students={students}
        attendance={attendance}
        schoolName={settings.schoolName}
        onShowToast={showToast}
      />

      {/* Modale Importateur CSV / Excel */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleStudentsImported}
        onRestoreDefaults={handleRestoreDefaultStudents}
        onShowToast={showToast}
      />

      {/* Modale Paramètres Établissement */}
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
