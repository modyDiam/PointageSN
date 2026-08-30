"use client";

import React, { useState, useMemo } from "react";
import { Student, AttendanceStatus, AttendanceSession } from "@/types";
import { Download, RotateCcw, Search, User, Phone, ShieldAlert, CheckCircle, FileText } from "lucide-react";
import { formatPhoneDisplay } from "@/utils/whatsapp";
import { exportMonthlyRegisterCSV } from "@/utils/csv";

interface MonthlyRegisterViewProps {
  students: Student[];
  availableClasses: string[];
  historySessions: AttendanceSession[];
  onResetMonthlyHistory: () => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const MonthlyRegisterView: React.FC<MonthlyRegisterViewProps> = ({
  students,
  availableClasses,
  historySessions,
  onResetMonthlyHistory,
  onShowToast,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState<boolean>(false);

  // Compute cumulative stats per student from all saved sessions
  const studentStats = useMemo(() => {
    const statsMap: Record<string, { absent: number; retard: number; present: number; totalSessions: number }> = {};

    students.forEach((s) => {
      statsMap[s.id] = { absent: 0, retard: 0, present: 0, totalSessions: 0 };
    });

    historySessions.forEach((session) => {
      Object.entries(session.records).forEach(([studentId, status]) => {
        if (!statsMap[studentId]) {
          statsMap[studentId] = { absent: 0, retard: 0, present: 0, totalSessions: 0 };
        }
        statsMap[studentId].totalSessions++;
        if (status === "ABSENT") statsMap[studentId].absent++;
        else if (status === "RETARD") statsMap[studentId].retard++;
        else if (status === "PRESENT") statsMap[studentId].present++;
      });
    });

    return statsMap;
  }, [students, historySessions]);

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

  // Overall statistics
  const overallTotals = useMemo(() => {
    let totalAbsents = 0;
    let totalRetards = 0;
    let totalPresents = 0;

    Object.values(studentStats).forEach((st) => {
      totalAbsents += st.absent;
      totalRetards += st.retard;
      totalPresents += st.present;
    });

    return { totalAbsents, totalRetards, totalPresents, sessionCount: historySessions.length };
  }, [studentStats, historySessions]);

  const handleExportCSV = () => {
    exportMonthlyRegisterCSV(students, studentStats, selectedClassFilter);
    onShowToast("Registre exporté en CSV (compatible Excel) 📥", "success");
  };

  const handleConfirmReset = () => {
    onResetMonthlyHistory();
    setIsConfirmResetOpen(false);
    onShowToast("Historique du mois réinitialisé avec succès", "info");
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header of Monthly Register */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Registre Cumulé du Mois
            </h2>
            <p className="text-[11px] text-slate-500">
              {historySessions.length} séance(s) clôturée(s) enregistrée(s)
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition active:scale-95 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmResetOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-slate-200 hover:border-rose-200"
            title="Réinitialiser l'historique de présence du mois"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Réinitialiser mois</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60">
          <button
            type="button"
            onClick={() => setSelectedClassFilter("ALL")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition whitespace-nowrap ${
              selectedClassFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Toutes ({students.length})
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

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer un élève..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cumulative Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student) => {
              const st = studentStats[student.id] || { absent: 0, retard: 0, present: 0, totalSessions: 0 };
              const hasAlert = st.absent >= 3 || st.retard >= 3;

              return (
                <div
                  key={student.id}
                  className="p-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  {/* Left: Student & Parent */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {student.classLevel}
                      </span>
                      {hasAlert && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3" /> Vigilance
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Tuteur : <span className="text-slate-700 font-medium">{student.parentName}</span> ({formatPhoneDisplay(student.parentPhone)})
                    </div>
                  </div>

                  {/* Right: Cumulative Badges */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs">
                    {/* Absences */}
                    <div
                      className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                        st.absent > 0
                          ? "bg-rose-50 border-rose-200 text-rose-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                      title={`${st.absent} absence(s) cumulée(s)`}
                    >
                      <span className="text-[11px] text-slate-400 font-normal">Abs :</span>
                      <span>{st.absent}</span>
                    </div>

                    {/* Retards */}
                    <div
                      className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                        st.retard > 0
                          ? "bg-amber-50 border-amber-200 text-amber-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                      title={`${st.retard} retard(s) cumulé(s)`}
                    >
                      <span className="text-[11px] text-slate-400 font-normal">Ret :</span>
                      <span>{st.retard}</span>
                    </div>

                    {/* Présences */}
                    <div
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-medium hidden sm:flex items-center gap-1"
                      title={`${st.present} présence(s)`}
                    >
                      <span className="text-[11px] text-slate-400 font-normal">Prés :</span>
                      <span>{st.present}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun élève trouvé dans cette vue.
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-xl animate-scale-up space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              Réinitialiser le registre mensuel ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toutes les séances et totaux cumulés d'absences et de retards du mois en cours seront effacés. Cette action est irréversible.
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
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
