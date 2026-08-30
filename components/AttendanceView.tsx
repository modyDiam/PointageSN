"use client";

import React, { useState, useMemo } from "react";
import {
  Student,
  AttendanceStatus,
  AttendanceRecord,
  ClassStats,
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
  MessageSquare,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button, Badge, Card, Modal } from "@/components/ui";

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
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState<boolean>(false);
  const [alertedStudentIds, setAlertedStudentIds] = useState<Set<string>>(new Set());
  const [lastUpdatedStudentId, setLastUpdatedStudentId] = useState<string | null>(null);

  const handleStatusUpdate = (studentId: string, status: AttendanceStatus) => {
    onStatusChange(studentId, status);
    setLastUpdatedStudentId(studentId);
    setTimeout(() => {
      setLastUpdatedStudentId((current) => (current === studentId ? null : current));
    }, 700);
  };

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
      const phone = s.parentPhone.toLowerCase();
      return fullName.includes(q) || parent.includes(q) || phone.includes(q);
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
    <div className="space-y-3 sm:space-y-3.5 animate-fade-in pb-28 sm:pb-24">
      
      {/* 1. TOP CONTEXT & MOBILE-SWIPEABLE CLASS SELECTOR */}
      <Card className="p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3">
        {/* Top line: Back button + School & Session meta */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <Button
            variant="secondary"
            size="xs"
            onClick={onBackToDashboard}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Dashboard
          </Button>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
            <span className="font-bold text-slate-800 truncate">{schoolName}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-600 shrink-0">{selectedSlot}</span>
          </div>
        </div>

        {/* Swipeable Class Tabs Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 max-w-full no-scrollbar">
            {availableClasses.map((cls) => {
              const isSelected = selectedClass === cls;
              const count = students.filter((s) => s.classLevel === cls).length;

              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onSelectClass(cls)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 shrink-0 ${
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

          <div className="text-xs text-slate-500 font-medium hidden md:block shrink-0">
            Effectif : <strong className="text-slate-800">{classStudents.length} élèves</strong>
          </div>
        </div>
      </Card>

      {/* 2. INSTANT LIVE METRIC CARDS (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Total */}
        <Card className="p-2.5 sm:p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Élèves
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums">
              {classStats.total}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600">
            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </Card>

        {/* Présents */}
        <Card className="p-2.5 sm:p-3.5 flex items-center justify-between bg-emerald-50/20 border-emerald-200/80">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Présents
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-700 tabular-nums">
              {classStats.present}
              <span className="text-[10px] sm:text-xs font-semibold ml-1 opacity-80">
                ({classStats.attendanceRate}%)
              </span>
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </Card>

        {/* Retards */}
        <Card className="p-2.5 sm:p-3.5 flex items-center justify-between bg-amber-50/20 border-amber-200/80">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Retards
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-700 tabular-nums">
              {classStats.retard}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </Card>

        {/* Absents */}
        <Card className="p-2.5 sm:p-3.5 flex items-center justify-between bg-rose-50/20 border-rose-200/80">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Absents
            </div>
            <div className="text-lg sm:text-2xl font-black text-rose-700 tabular-nums">
              {classStats.absent}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </Card>
      </div>

      {/* 3. TOOLBAR (SEARCH + 1-TAP "TOUS PRÉSENTS") */}
      <Card className="p-2 sm:p-3 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onMarkAllPresent}
          leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
          className="shrink-0 font-bold"
        >
          Tous Présents
        </Button>
      </Card>

      {/* 4. STUDENTS ROLL CALL LIST / CARDS */}
      <div className="space-y-2.5">
        
        {/* DESKTOP TABLE CONTAINER (Hidden on Mobile) */}
        <Card className="hidden sm:block overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Élève (Nom & Prénom)</div>
            <div className="col-span-3">Contact Tuteur</div>
            <div className="col-span-4 text-center">Pointage du Statut</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student, index) => {
              const currentStatus = attendance[student.id] || "PRESENT";
              const isAlerted = alertedStudentIds.has(student.id);
              const isRecentlyUpdated = lastUpdatedStudentId === student.id;
              const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
              const whatsappUrl = generateParentWhatsAppLink(student, currentStatus, schoolName);

              return (
                <div
                  key={student.id}
                  className={`px-4 py-3 transition-all duration-300 grid grid-cols-12 items-center gap-3 ${
                    isRecentlyUpdated
                      ? "ring-2 ring-navy-900/20 bg-slate-100"
                      : currentStatus === "ABSENT"
                      ? "bg-rose-50/25"
                      : currentStatus === "RETARD"
                      ? "bg-amber-50/25"
                      : "hover:bg-slate-50/70"
                  }`}
                >
                  <div className="col-span-1 text-center text-xs font-mono text-slate-400">
                    {index + 1}
                  </div>

                  <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        currentStatus === "ABSENT"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : currentStatus === "RETARD"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200/80"
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {student.firstName} {student.lastName}
                        </span>
                        {isRecentlyUpdated && (
                          <span className="text-[10px] text-emerald-700 font-bold animate-fade-in">
                            ✓ Enregistré
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 text-xs">
                    <div className="text-slate-800 font-medium truncate">
                      {student.parentName}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <a
                        href={`tel:+${student.parentPhone}`}
                        className="hover:text-brand-600 transition hover:underline"
                      >
                        {formatPhoneDisplay(student.parentPhone)}
                      </a>
                    </div>
                  </div>

                  <div className="col-span-4 flex items-center justify-end gap-2">
                    <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/90 text-xs font-bold shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(student.id, "PRESENT")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 ${
                          currentStatus === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Présent</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(student.id, "RETARD")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 ${
                          currentStatus === "RETARD"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Retard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(student.id, "ABSENT")}
                        className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 ${
                          currentStatus === "ABSENT"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>
                    </div>

                    {currentStatus !== "PRESENT" && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleWhatsAppClick(student.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition shadow-2xs active:scale-95 ${
                          isAlerted
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-[#25D366] hover:bg-[#20bd5a] text-white"
                        }`}
                        title="Alerter le parent sur WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>{isAlerted ? "Envoyé ✓" : "WhatsApp"}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* MOBILE TACTILE CARDS (Visible only on < 640px) */}
        <div className="sm:hidden space-y-2.5">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => {
              const currentStatus = attendance[student.id] || "PRESENT";
              const isAlerted = alertedStudentIds.has(student.id);
              const isRecentlyUpdated = lastUpdatedStudentId === student.id;
              const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
              const whatsappUrl = generateParentWhatsAppLink(student, currentStatus, schoolName);

              return (
                <Card
                  key={student.id}
                  className={`p-3.5 space-y-3 transition-all duration-200 ${
                    isRecentlyUpdated
                      ? "ring-2 ring-navy-900/30 bg-slate-50 scale-[1.01]"
                      : currentStatus === "ABSENT"
                      ? "bg-rose-50/20 border-rose-200/90"
                      : currentStatus === "RETARD"
                      ? "bg-amber-50/20 border-amber-200/90"
                      : "bg-white"
                  }`}
                >
                  {/* Top line: Index, Name, Avatar & Live Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          currentStatus === "ABSENT"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : currentStatus === "RETARD"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-slate-400">
                            #{index + 1}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 truncate">
                            {student.firstName} {student.lastName}
                          </h3>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <span>{student.parentName}</span>
                          <span className="text-slate-300">•</span>
                          <a
                            href={`tel:+${student.parentPhone}`}
                            className="font-mono text-slate-700 hover:text-brand-600 underline decoration-slate-300"
                          >
                            {formatPhoneDisplay(student.parentPhone)}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={
                        currentStatus === "PRESENT"
                          ? "success"
                          : currentStatus === "RETARD"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {currentStatus === "PRESENT"
                        ? "Présent"
                        : currentStatus === "RETARD"
                        ? "Retard"
                        : "Absent"}
                    </Badge>
                  </div>

                  {/* LARGE 44px TACTILE 3-STATE SEGMENTED BUTTONS FOR 1-HAND USE */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                    {/* 1. PRÉSENT */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(student.id, "PRESENT")}
                      className={`h-11 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                        currentStatus === "PRESENT"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Présent</span>
                    </button>

                    {/* 2. RETARD */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(student.id, "RETARD")}
                      className={`h-11 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                        currentStatus === "RETARD"
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                      }`}
                    >
                      <Clock className="w-4 h-4 stroke-[2.5]" />
                      <span>Retard</span>
                    </button>

                    {/* 3. ABSENT */}
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(student.id, "ABSENT")}
                      className={`h-11 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                        currentStatus === "ABSENT"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                      }`}
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Absent</span>
                    </button>
                  </div>

                  {/* 1-TAP WHATSAPP PARENT ALERT (Only shown when Absent or Retard) */}
                  {currentStatus !== "PRESENT" && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleWhatsAppClick(student.id)}
                      className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-2xs ${
                        isAlerted
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-[#25D366] hover:bg-[#20bd5a] text-white"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>
                        {isAlerted
                          ? "Alerte WhatsApp transmise ✓"
                          : `Alerter ${student.parentName} sur WhatsApp ↗`}
                      </span>
                    </a>
                  )}
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Aucun élève ne correspond à votre filtre "{searchQuery}".
            </Card>
          )}
        </div>

      </div>

      {/* 5. STICKY THUMB-FRIENDLY BOTTOM BAR (ONE-HAND MOBILE OPTIMIZED) */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 sm:px-4 sm:py-3 z-30 shadow-lg flex items-center justify-between gap-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Live Counters */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
          <Badge variant="success" size="sm">
            {classStats.present} Présents
          </Badge>
          <Badge variant="danger" size="sm">
            {classStats.absent} Absents
          </Badge>
          {classStats.retard > 0 && (
            <Badge variant="warning" size="sm">
              {classStats.retard} Retards
            </Badge>
          )}
        </div>

        {/* Large Thumb-accessible closure button */}
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsConfirmCloseOpen(true)}
          leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          className="shrink-0 h-10 sm:h-9 px-4 font-bold active:scale-95"
        >
          <span>Clôturer l'appel</span>
        </Button>
      </div>

      {/* 6. CONFIRMATION DIALOG MODAL */}
      <Modal
        isOpen={isConfirmCloseOpen}
        onClose={() => setIsConfirmCloseOpen(false)}
        title="Clôturer le pointage de séance ?"
        description={`Classe ${selectedClass} • ${schoolName}`}
        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        maxWidth="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmCloseOpen(false)}
            >
              Reprendre l'appel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleProceedClose}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Confirmer & Archiver
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Vous êtes sur le point de valider définitivement la liste des présences pour la classe {selectedClass}.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Présents</div>
              <div className="text-base font-black text-emerald-700">{classStats.present}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Retards</div>
              <div className="text-base font-black text-amber-600">{classStats.retard}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Absents</div>
              <div className="text-base font-black text-rose-600">{classStats.absent}</div>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};
