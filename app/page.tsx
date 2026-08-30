"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  mockStudents,
  AVAILABLE_CLASSES,
  DEFAULT_SCHOOL_NAME,
} from "@/data/mockStudents";
import { Student, AttendanceStatus, AttendanceRecord, ClassStats } from "@/types";
import { Header } from "@/components/Header";
import { ClassSelector } from "@/components/ClassSelector";
import { StatsDashboard } from "@/components/StatsDashboard";
import { StudentCard } from "@/components/StudentCard";
import { SummaryModal } from "@/components/SummaryModal";
import { Toast } from "@/components/Toast";
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ClipboardList,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const STORAGE_KEY_ATTENDANCE = "pointagesn_attendance_v1";
const STORAGE_KEY_SCHOOL = "pointagesn_school_v1";

export default function PointageSNApp() {
  const [selectedClass, setSelectedClass] = useState<string>("6e A");
  const [schoolName, setSchoolName] = useState<string>(DEFAULT_SCHOOL_NAME);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState<boolean>(false);
  
  // Search and status filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AttendanceStatus>("ALL");

  // Summary Modal & Toast state
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  // Initialize attendance with default 'PRESENT' for all students
  const getDefaultAttendance = (): AttendanceRecord => {
    const initial: AttendanceRecord = {};
    mockStudents.forEach((student) => {
      initial[student.id] = "PRESENT";
    });
    return initial;
  };

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedSchool = localStorage.getItem(STORAGE_KEY_SCHOOL);
      if (savedSchool) {
        setSchoolName(savedSchool);
      }

      const savedAttendance = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      if (savedAttendance) {
        const parsed = JSON.parse(savedAttendance);
        // Ensure every student has a status
        const merged: AttendanceRecord = getDefaultAttendance();
        Object.assign(merged, parsed);
        setAttendance(merged);
      } else {
        setAttendance(getDefaultAttendance());
      }
    } catch (e) {
      console.error("Failed to load attendance from localStorage:", e);
      setAttendance(getDefaultAttendance());
    } finally {
      setIsLoadedFromStorage(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoadedFromStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
    } catch (e) {
      console.error("Failed to save attendance to localStorage:", e);
    }
  }, [attendance, isLoadedFromStorage]);

  const handleSchoolNameChange = (newName: string) => {
    setSchoolName(newName);
    try {
      localStorage.setItem(STORAGE_KEY_SCHOOL, newName);
      showToast("Nom de l'établissement mis à jour !", "info");
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

  // Batch action: mark all students in current class as PRESENT
  const handleMarkAllClassPresent = () => {
    const classStudents = mockStudents.filter(
      (s) => s.classLevel === selectedClass
    );
    setAttendance((prev) => {
      const next = { ...prev };
      classStudents.forEach((s) => {
        next[s.id] = "PRESENT";
      });
      return next;
    });
    showToast(`Tous les élèves de ${selectedClass} sont marqués Présent ✅`, "success");
  };

  // Reset class attendance
  const handleResetClass = () => {
    const classStudents = mockStudents.filter(
      (s) => s.classLevel === selectedClass
    );
    setAttendance((prev) => {
      const next = { ...prev };
      classStudents.forEach((s) => {
        next[s.id] = "PRESENT";
      });
      return next;
    });
    showToast(`Pointage de ${selectedClass} réinitialisé`, "info");
  };

  // Filter students for current view
  const currentClassStudents = useMemo(() => {
    return mockStudents.filter((s) => s.classLevel === selectedClass);
  }, [selectedClass]);

  const filteredStudents = useMemo(() => {
    return currentClassStudents.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const parentName = student.parentName.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query || fullName.includes(query) || parentName.includes(query);

      const currentStatus = attendance[student.id] || "PRESENT";
      const matchesStatus =
        statusFilter === "ALL" || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [currentClassStudents, searchQuery, statusFilter, attendance]);

  // Compute live stats for current class
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}

      {/* Header Sticky */}
      <Header
        schoolName={schoolName}
        onSchoolNameChange={handleSchoolNameChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        
        {/* Class Selector Bar */}
        <ClassSelector
          classes={AVAILABLE_CLASSES}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          students={mockStudents}
          attendance={attendance}
        />

        {/* Real-time Dashboard KPI */}
        <StatsDashboard
          stats={classStats}
          onMarkAllPresent={handleMarkAllClassPresent}
          onResetClassAttendance={handleResetClass}
        />

        {/* Action Header & Search / Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Rechercher un élève en ${selectedClass}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Status Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                statusFilter === "ALL"
                  ? "bg-slate-800 text-white border-slate-600 shadow"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              Tous ({currentClassStudents.length})
            </button>
            <button
              onClick={() => setStatusFilter("ABSENT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                statusFilter === "ABSENT"
                  ? "bg-rose-950/90 text-rose-300 border-rose-600 shadow"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-rose-300"
              }`}
            >
              Absents ({classStats.absent})
            </button>
            <button
              onClick={() => setStatusFilter("RETARD")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                statusFilter === "RETARD"
                  ? "bg-amber-950/90 text-amber-300 border-amber-600 shadow"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-amber-300"
              }`}
            >
              Retards ({classStats.retard})
            </button>
            <button
              onClick={() => setStatusFilter("PRESENT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                statusFilter === "PRESENT"
                  ? "bg-emerald-950/90 text-emerald-300 border-emerald-600 shadow"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-emerald-300"
              }`}
            >
              Présents ({classStats.present})
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-3">
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredStudents.map((student) => {
                const currentStatus = attendance[student.id] || "PRESENT";
                return (
                  <StudentCard
                    key={student.id}
                    student={student}
                    status={currentStatus}
                    onStatusChange={handleStatusChange}
                    schoolName={schoolName}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-300">
                Aucun élève trouvé
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Modifiez votre recherche ou réinitialisez le filtre de statut.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Floating Bar / Session Closure Action */}
        <div className="sticky bottom-4 z-30 pt-4">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Séance en cours : {selectedClass}</span>
                  <span className="text-xs text-emerald-400 font-semibold">
                    ({classStats.present} prés., {classStats.absent} abs., {classStats.retard} ret.)
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Save className="w-3 h-3 text-emerald-400" />
                  <span>Données automatiquement sauvegardées</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSummaryOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-900/40 transition active:scale-95 border border-emerald-400/40"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Clôturer le pointage & Rapport</span>
            </button>
          </div>
        </div>
      </main>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        selectedClass={selectedClass}
        students={mockStudents}
        attendance={attendance}
        schoolName={schoolName}
        onShowToast={showToast}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 justify-center">
            <span>PointageSN</span>
            <span>🇸🇳</span>
            <span>• Développé pour la vie scolaire au Sénégal</span>
          </p>
          <p className="text-[11px] text-slate-600">
            Next.js 14 • Tailwind CSS • TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}
