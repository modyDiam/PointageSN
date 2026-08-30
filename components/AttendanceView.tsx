"use client";

import React, { useState, useMemo } from "react";
import {
  Student,
  AttendanceStatus,
  AttendanceRecord,
  ClassStats,
  SchoolSettings,
} from "@/types";
import {
  generateParentWhatsAppLink,
  formatPhoneDisplay,
} from "@/utils/whatsapp";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  CheckCheck,
  Search,
  Copy,
  MessageSquare,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Phone,
  HelpCircle,
} from "lucide-react";

interface AttendanceViewProps {
  students: Student[];
  availableClasses: string[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  selectedSlot: string;
  currentDateFormatted: string;
  attendance: AttendanceRecord;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onMarkAllPresent: () => void;
  onCloseAndCopyReport: () => void;
  onBackToDashboard: () => void;
  schoolName: string;
  absentTemplate?: string;
  retardTemplate?: string;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  availableClasses,
  selectedClass,
  onSelectClass,
  selectedSlot,
  currentDateFormatted,
  attendance,
  onStatusChange,
  onMarkAllPresent,
  onCloseAndCopyReport,
  onBackToDashboard,
  schoolName,
  absentTemplate,
  retardTemplate,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState<boolean>(false);
  const [alertedStudentIds, setAlertedStudentIds] = useState<Set<string>>(new Set());

  // Filter students for active class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classLevel === selectedClass);
  }, [students, selectedClass]);

  // Search filtered students
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase().trim();
    return classStudents.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const parent = s.parentName.toLowerCase();
      return fullName.includes(q) || parent.includes(q);
    });
  }, [classStudents, searchQuery]);

  // Instant Live Attendance Statistics
  const classStats: ClassStats = useMemo(() => {
    const total = classStudents.length;
    let present = 0;
    let absent = 0;
    let retard = 0;

    classStudents.forEach((s) => {
      const status = attendance[s.id] || "PRESENT";
      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "RETARD") retard++;
    });

    const attendanceRate =
      total > 0 ? Math.round(((present + retard) / total) * 100) : 100;
    return { total, present, absent, retard, attendanceRate };
  }, [classStudents, attendance]);

  const handleWhatsAppClick = (studentId: string) => {
    setAlertedStudentIds((prev) => new Set(prev).add(studentId));
  };

  const handleProceedClose = () => {
    setIsConfirmCloseOpen(false);
    onCloseAndCopyReport();
  };

  return (
    <div className="space-y-3.5 animate-fade-in pb-20">
      
      {/* 1. TOP CONTEXT & NAVIGATION BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
        {/* Top line: Back button + School & Teacher info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl transition shadow-2xs self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tableau de bord</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-800 font-bold">{schoolName}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Surveillant / Professeur en charge</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentDateFormatted} ({selectedSlot})</span>
            </div>
          </div>
        </div>

        {/* Bottom line: Class Switcher Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pt-0.5">
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 max-w-full">
            {availableClasses.map((cls) => {
              const isSelected = selectedClass === cls;
              const count = students.filter((s) => s.classLevel === cls).length;

              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onSelectClass(cls)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? "bg-navy-900 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <span>Classe {cls}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-medium hidden md:block">
            Effectif classe : <strong className="text-slate-800">{classStudents.length} élèves</strong>
          </div>
        </div>
      </div>

      {/* 2. INSTANT LIVE METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Élèves
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
              {classStats.total}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600">
            <Building className="w-4 h-4" />
          </div>
        </div>

        {/* Présents */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between bg-emerald-50/15">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Présents
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">
              {classStats.present}
              <span className="text-xs font-semibold ml-1 opacity-80">
                ({classStats.attendanceRate}%)
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        {/* Retards */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between bg-amber-50/15">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Retards
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 tabular-nums">
              {classStats.retard}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Absents */}
        <div className="bg-white border border-rose-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex items-center justify-between bg-rose-50/15">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Absents
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 tabular-nums">
              {classStats.absent}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <X className="w-4 h-4 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR (Search & Quick Batch Action) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Rechercher un élève de ${selectedClass}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Batch buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllPresent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/70 rounded-lg transition active:scale-95 whitespace-nowrap"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tout marquer Présent</span>
          </button>
        </div>
      </div>

      {/* 4. STUDENT ROLL CALL LIST / TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Table Header for Desktop */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="sm:col-span-1 text-center">#</div>
          <div className="sm:col-span-4">Élève & Classe</div>
          <div className="sm:col-span-3">Tuteur & Téléphone</div>
          <div className="sm:col-span-3 text-center">Statut de Présence</div>
          <div className="sm:col-span-1 text-right">Alerte</div>
        </div>

        {/* Rows */}
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student, idx) => {
              const status = attendance[student.id] || "PRESENT";
              const isAlerted = alertedStudentIds.has(student.id);
              const whatsappUrl = generateParentWhatsAppLink(
                student,
                status,
                schoolName,
                absentTemplate,
                retardTemplate
              );
              const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:px-4 sm:py-3 transition-colors flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 sm:gap-3 ${
                    status === "ABSENT"
                      ? "bg-rose-50/30 hover:bg-rose-50/45"
                      : status === "RETARD"
                      ? "bg-amber-50/30 hover:bg-amber-50/45"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Col 0: Index (Desktop) */}
                  <div className="hidden sm:block sm:col-span-1 text-center text-xs font-mono text-slate-400">
                    {idx + 1}
                  </div>

                  {/* Col 1: Élève */}
                  <div className="sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        status === "ABSENT"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : status === "RETARD"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60 shrink-0">
                          {student.classLevel}
                        </span>
                      </div>

                      {/* Mobile parent line */}
                      <div className="sm:hidden text-[11px] text-slate-500 mt-0.5 truncate">
                        {student.parentName} •{" "}
                        <a
                          href={`tel:+${student.parentPhone}`}
                          className="hover:underline text-slate-600 font-mono"
                        >
                          {formatPhoneDisplay(student.parentPhone)}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Tuteur & Téléphone (Desktop) */}
                  <div className="hidden sm:block sm:col-span-3 text-xs">
                    <div className="text-slate-800 font-medium truncate">
                      {student.parentName}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <a
                        href={`tel:+${student.parentPhone}`}
                        className="hover:text-brand-600 transition hover:underline"
                      >
                        {formatPhoneDisplay(student.parentPhone)}
                      </a>
                    </div>
                  </div>

                  {/* Col 3: Tactile 3-Segment Button (Big targets) */}
                  <div className="sm:col-span-3">
                    <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1 border border-slate-200/70">
                      {/* Présent Button */}
                      <button
                        type="button"
                        onClick={() => onStatusChange(student.id, "PRESENT")}
                        className={`h-9 sm:h-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95 ${
                          status === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Présent</span>
                      </button>

                      {/* Retard Button */}
                      <button
                        type="button"
                        onClick={() => onStatusChange(student.id, "RETARD")}
                        className={`h-9 sm:h-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95 ${
                          status === "RETARD"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Retard</span>
                      </button>

                      {/* Absent Button */}
                      <button
                        type="button"
                        onClick={() => onStatusChange(student.id, "ABSENT")}
                        className={`h-9 sm:h-8 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95 ${
                          status === "ABSENT"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>

                  {/* Col 4: Secondary WhatsApp Button */}
                  <div className="sm:col-span-1 flex items-center sm:justify-end">
                    {status === "ABSENT" || status === "RETARD" ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleWhatsAppClick(student.id)}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all shadow-2xs active:scale-95 whitespace-nowrap ${
                          isAlerted
                            ? "bg-emerald-700 hover:bg-emerald-800"
                            : "bg-[#25D366] hover:bg-[#20bd5a]"
                        }`}
                        title="Envoyer la notification WhatsApp au parent"
                      >
                        <MessageSquare className="w-3 h-3 fill-current shrink-0" />
                        <span className="sm:hidden">{isAlerted ? "WhatsApp envoyé ↗" : "Alerter parent ↗"}</span>
                        <span className="hidden sm:inline">↗</span>
                      </a>
                    ) : (
                      <span className="hidden sm:inline-block text-[11px] text-slate-300 italic">
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun élève trouvé pour cette recherche.
          </div>
        )}
      </div>

      {/* 5. STICKY BOTTOM SESSION CLOSING BAR */}
      <div className="fixed bottom-4 left-0 right-0 lg:left-64 z-30 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-modal flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Live context recap */}
            <div className="flex items-center gap-2.5 text-xs">
              <span className="font-extrabold text-slate-900">
                Pointage {selectedClass} :
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                {classStats.present} présents ({classStats.attendanceRate}%)
              </span>
              {classStats.absent > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                  {classStats.absent} absent{classStats.absent > 1 ? "s" : ""}
                </span>
              )}
              {classStats.retard > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                  {classStats.retard} retard{classStats.retard > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => setIsConfirmCloseOpen(true)}
              className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <Copy className="w-4 h-4" />
              <span>Clôturer la séance & Copier le rapport</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. CONFIRMATION MODAL BEFORE CLOSING */}
      {isConfirmCloseOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full shadow-modal animate-scale-up space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Clôturer l'appel • Classe {selectedClass} ?
                </h3>
                <p className="text-[11px] text-slate-500">
                  {schoolName} • {currentDateFormatted} ({selectedSlot})
                </p>
              </div>
            </div>

            {/* Recap */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Effectif total :</span>
                <strong className="text-slate-900">{classStats.total} élève(s)</strong>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-emerald-700">Élèves présents :</span>
                <strong className="text-emerald-800">{classStats.present} ({classStats.attendanceRate}%)</strong>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-rose-700">Élèves absents :</span>
                <strong className="text-rose-800">{classStats.absent}</strong>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-amber-700">Arrivées tardives :</span>
                <strong className="text-amber-800">{classStats.retard}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Le rapport officiel sera copié dans le presse-papiers et la séance sera enregistrée dans le registre du mois.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmCloseOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Vérifier encore
              </button>
              <button
                type="button"
                onClick={handleProceedClose}
                className="px-4 py-1.5 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmer & Clôturer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
