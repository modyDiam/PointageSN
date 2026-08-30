"use client";

import React, { useState, useMemo } from "react";
import { Student, AttendanceSession } from "@/types";
import {
  Download,
  RotateCcw,
  Search,
  User,
  Phone,
  ShieldAlert,
  FileText,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { formatPhoneDisplay, generateParentWhatsAppLink } from "@/utils/whatsapp";
import { exportMonthlyRegisterCSV } from "@/utils/csv";

interface MonthlyRegisterViewProps {
  students: Student[];
  availableClasses: string[];
  historySessions: AttendanceSession[];
  onResetMonthlyHistory: () => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
  schoolName: string;
}

export const MonthlyRegisterView: React.FC<MonthlyRegisterViewProps> = ({
  students,
  availableClasses,
  historySessions,
  onResetMonthlyHistory,
  onShowToast,
  schoolName,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState<boolean>(false);

  // Compute cumulative stats per student from all saved sessions
  const studentStats = useMemo(() => {
    const statsMap: Record<
      string,
      { absent: number; retard: number; present: number; totalSessions: number; rate: number }
    > = {};

    students.forEach((s) => {
      statsMap[s.id] = { absent: 0, retard: 0, present: 0, totalSessions: 0, rate: 100 };
    });

    historySessions.forEach((session) => {
      Object.entries(session.records).forEach(([studentId, status]) => {
        if (!statsMap[studentId]) {
          statsMap[studentId] = { absent: 0, retard: 0, present: 0, totalSessions: 0, rate: 100 };
        }
        statsMap[studentId].totalSessions++;
        if (status === "ABSENT") statsMap[studentId].absent++;
        else if (status === "RETARD") statsMap[studentId].retard++;
        else if (status === "PRESENT") statsMap[studentId].present++;
      });
    });

    // Compute individual rate
    Object.keys(statsMap).forEach((id) => {
      const item = statsMap[id];
      if (item.totalSessions > 0) {
        item.rate = Math.round(((item.present + item.retard) / item.totalSessions) * 100);
      } else {
        item.rate = 100;
      }
    });

    return statsMap;
  }, [students, historySessions]);

  // Overall Global KPI Metrics
  const overallTotals = useMemo(() => {
    let totalAbsents = 0;
    let totalRetards = 0;
    let totalPresents = 0;
    let criticalStudentsCount = 0;

    Object.values(studentStats).forEach((st) => {
      totalAbsents += st.absent;
      totalRetards += st.retard;
      totalPresents += st.present;
      if (st.absent >= 3 || st.retard >= 3) {
        criticalStudentsCount++;
      }
    });

    const totalRecords = totalAbsents + totalRetards + totalPresents;
    const globalRate = totalRecords > 0 ? Math.round(((totalPresents + totalRetards) / totalRecords) * 100) : 100;

    return {
      totalAbsents,
      totalRetards,
      totalPresents,
      sessionCount: historySessions.length,
      globalRate,
      criticalStudentsCount,
    };
  }, [studentStats, historySessions]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass =
        selectedClassFilter === "ALL" || student.classLevel === selectedClassFilter;
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const parentName = student.parentName.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || fullName.includes(query) || parentName.includes(query);

      return matchesClass && matchesSearch;
    });
  }, [students, selectedClassFilter, searchQuery]);

  const handleExportCSV = () => {
    exportMonthlyRegisterCSV(students, studentStats, selectedClassFilter);
    onShowToast("Registre exporté au format CSV / Excel 📥", "success");
  };

  const handleConfirmReset = () => {
    onResetMonthlyHistory();
    setIsConfirmResetOpen(false);
    onShowToast("Historique du registre réinitialisé avec succès", "info");
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      
      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Séances */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Séances Clôturées</span>
            <FileText className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
            {overallTotals.sessionCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Enregistrées ce mois</p>
        </div>

        {/* Card 2: Assiduité Moyenne */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux d'Assiduité</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">
            {overallTotals.globalRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Moyenne consolidée</p>
        </div>

        {/* Card 3: Absences Cumulées */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Absences</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 tabular-nums">
            {overallTotals.totalAbsents}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Cumul des séances</p>
        </div>

        {/* Card 4: Retards Cumulés */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Retards</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 tabular-nums">
            {overallTotals.totalRetards}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Arrivées tardives</p>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedClassFilter("ALL")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition whitespace-nowrap ${
              selectedClassFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Toutes les classes ({students.length})
          </button>
          {availableClasses.map((cls) => {
            const isSelected = selectedClassFilter === cls;
            const count = students.filter((s) => s.classLevel === cls).length;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClassFilter(cls)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition whitespace-nowrap ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {cls} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition active:scale-95 shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmResetOpen(true)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-200 shrink-0"
            title="Réinitialiser l'historique du mois"
            aria-label="Réinitialiser l'historique du mois"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Registry Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2 bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="sm:col-span-4">Élève & Classe</div>
          <div className="sm:col-span-3">Tuteur & Téléphone</div>
          <div className="sm:col-span-3 text-center">Bilan Cumulé (Abs / Ret / Prés)</div>
          <div className="sm:col-span-2 text-right">Assiduité & Alerte</div>
        </div>

        {/* Student Rows */}
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student) => {
              const st = studentStats[student.id] || {
                absent: 0,
                retard: 0,
                present: 0,
                totalSessions: 0,
                rate: 100,
              };
              const isCritical = st.absent >= 3;
              const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
              const whatsappUrl = generateParentWhatsAppLink(
                student,
                "ABSENT",
                schoolName
              );

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:px-4 sm:py-2.5 transition-colors flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-3 ${
                    isCritical ? "bg-rose-50/30 hover:bg-rose-50/50" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Col 1: Élève */}
                  <div className="sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCritical
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
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
                        {isCritical && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3" /> Assiduité critique
                          </span>
                        )}
                      </div>

                      {/* Mobile parent line */}
                      <div className="sm:hidden text-[11px] text-slate-500 mt-0.5">
                        Tuteur : {student.parentName} ({formatPhoneDisplay(student.parentPhone)})
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Tuteur (Desktop) */}
                  <div className="hidden sm:block sm:col-span-3 text-xs">
                    <div className="text-slate-800 font-medium truncate">
                      {student.parentName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {formatPhoneDisplay(student.parentPhone)}
                    </div>
                  </div>

                  {/* Col 3: Bilan Cumulé */}
                  <div className="sm:col-span-3 flex items-center sm:justify-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md border text-xs font-semibold tabular-nums ${
                        st.absent > 0
                          ? "bg-rose-50 border-rose-200 text-rose-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                      title={`${st.absent} absence(s) cumulée(s)`}
                    >
                      Abs: <strong>{st.absent}</strong>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md border text-xs font-semibold tabular-nums ${
                        st.retard > 0
                          ? "bg-amber-50 border-amber-200 text-amber-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                      title={`${st.retard} retard(s) cumulé(s)`}
                    >
                      Ret: <strong>{st.retard}</strong>
                    </span>

                    <span
                      className="px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium tabular-nums hidden md:inline-block"
                      title={`${st.present} présence(s)`}
                    >
                      Prés: {st.present}
                    </span>
                  </div>

                  {/* Col 4: Taux & Action WhatsApp */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        st.rate < 75
                          ? "text-rose-600"
                          : st.rate < 90
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {st.rate}%
                    </span>

                    {isCritical && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-semibold rounded-md transition shadow-2xs"
                        title="Envoyer un rappel de présence au parent"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        <span>Rappel ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun élève ne correspond aux critères sélectionnés.
          </div>
        )}
      </div>

      {/* Confirmation Modal for Reset */}
      {isConfirmResetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-modal animate-scale-up space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              Réinitialiser le registre mensuel ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toutes les séances de pointage et les cumuls d'absences/retards enregistrés pour ce mois seront effacés. Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmResetOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
              >
                Confirmer l'effacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
