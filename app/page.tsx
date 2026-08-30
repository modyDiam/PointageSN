"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  mockStudents,
  AVAILABLE_CLASSES,
  DEFAULT_SCHOOL_NAME,
} from "@/data/mockStudents";
import { Student, AttendanceStatus, AttendanceRecord, ClassStats } from "@/types";
import { generateParentWhatsAppLink, formatPhoneDisplay, generateDirectionReport } from "@/utils/whatsapp";
import { Toast } from "@/components/Toast";
import { SummaryModal } from "@/components/SummaryModal";
import { CheckCheck, Copy, Send, Search, X } from "lucide-react";

const STORAGE_KEY_ATTENDANCE = "pointagesn_attendance_v3";
const STORAGE_KEY_SCHOOL = "pointagesn_school_v3";

const TIME_SLOTS = [
  "08h - 12h",
  "14h - 18h",
  "08h - 14h",
] as const;

export default function PointageSNApp() {
  const [selectedClass, setSelectedClass] = useState<string>("6e A");
  const [schoolName, setSchoolName] = useState<string>(DEFAULT_SCHOOL_NAME);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState<boolean>(false);
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modale & Toast
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  // Initialize attendance with default 'PRESENT'
  const getDefaultAttendance = (): AttendanceRecord => {
    const initial: AttendanceRecord = {};
    mockStudents.forEach((student) => {
      initial[student.id] = "PRESENT";
    });
    return initial;
  };

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

  // Load from localStorage
  useEffect(() => {
    try {
      const savedSchool = localStorage.getItem(STORAGE_KEY_SCHOOL);
      if (savedSchool) setSchoolName(savedSchool);

      const savedAttendance = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
      if (savedAttendance) {
        const parsed = JSON.parse(savedAttendance);
        const merged: AttendanceRecord = getDefaultAttendance();
        Object.assign(merged, parsed);
        setAttendance(merged);
      } else {
        setAttendance(getDefaultAttendance());
      }
    } catch (e) {
      console.error(e);
      setAttendance(getDefaultAttendance());
    } finally {
      setIsLoadedFromStorage(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoadedFromStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance, isLoadedFromStorage]);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToastInfo({ message, type });
  };

  // Status Change
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  // Mark all class present
  const handleMarkAllClassPresent = () => {
    const classStudents = mockStudents.filter((s) => s.classLevel === selectedClass);
    setAttendance((prev) => {
      const next = { ...prev };
      classStudents.forEach((s) => {
        next[s.id] = "PRESENT";
      });
      return next;
    });
    showToast(`Tous marqués Présent (${selectedClass})`, "success");
  };

  // Filtered Students
  const currentClassStudents = useMemo(() => {
    return mockStudents.filter((s) => s.classLevel === selectedClass);
  }, [selectedClass]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return currentClassStudents;
    const query = searchQuery.toLowerCase().trim();
    return currentClassStudents.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const parentName = student.parentName.toLowerCase();
      return fullName.includes(query) || parentName.includes(query);
    });
  }, [currentClassStudents, searchQuery]);

  // Compute live stats
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

    const attendanceRate = total > 0 ? Math.round(((present + retard) / total) * 100) : 100;
    return { total, present, absent, retard, attendanceRate };
  }, [currentClassStudents, attendance]);

  // Clôturer & Copier directement le rapport
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

    const reportText = generateDirectionReport(
      selectedClass,
      mockStudents,
      attendance,
      schoolName,
      sessionDateFormatted
    );

    try {
      await navigator.clipboard.writeText(reportText);
      showToast("Rapport copié dans le presse-papiers ! 📋", "success");
    } catch (err) {
      console.error(err);
    }
    setIsSummaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}

      {/* 2. EN-TÊTE ÉPURÉ & COMPACT (Une seule ligne) */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Gauche : Titre + Onglets de classe */}
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight shrink-0">
              Pointage<span className="text-blue-600">SN</span>
            </span>

            {/* Onglets directs [6e A] [3e A] [Tle S2] */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              {AVAILABLE_CLASSES.map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
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
          </div>

          {/* Droite : Date et créneau horaire discrets */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
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
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 space-y-3">
        
        {/* 3. MINI-BARRE DE COMPTEURS (Sobre et compacte) */}
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

        {/* 4. CARTES ÉLÈVES ALLÉGÉES */}
        <div className="space-y-2">
          {filteredStudents.map((student) => {
            const status = attendance[student.id] || "PRESENT";
            const whatsappUrl = generateParentWhatsAppLink(student, status, schoolName);

            return (
              <div
                key={student.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Ligne 1 : Nom et prénom en gras, nom et numéro du parent en gris clair */}
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
        </div>

        {/* 5. ACTION PRINCIPALE : Bouton unique fixé en bas */}
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

      </main>

      {/* Summary Modal for Full Review & Transfer */}
      <SummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        selectedClass={selectedClass}
        students={mockStudents}
        attendance={attendance}
        schoolName={schoolName}
        onShowToast={showToast}
      />
    </div>
  );
}
