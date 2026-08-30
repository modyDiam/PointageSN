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
import { Button, Badge, Card, Modal } from "@/components/ui";

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
      criticalStudentsCount,
      globalRate,
      sessionsCount: historySessions.length,
    };
  }, [studentStats, historySessions]);

  // Filter students by class and search
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesClass =
        selectedClassFilter === "ALL" || student.classLevel === selectedClassFilter;
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const parentName = student.parentName.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        fullName.includes(searchQuery.toLowerCase().trim()) ||
        parentName.includes(searchQuery.toLowerCase().trim());

      return matchesClass && matchesSearch;
    });
  }, [students, selectedClassFilter, searchQuery]);

  const handleExport = () => {
    exportMonthlyRegisterCSV(students, studentStats, schoolName);
    onShowToast("Registre exporté en CSV (compatible Excel) ! 📥", "success");
  };

  const handleConfirmReset = () => {
    onResetMonthlyHistory();
    setIsConfirmResetOpen(false);
    onShowToast("Historique et registre réinitialisés avec succès !", "info");
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      
      {/* 1. TOP HEADER & EXECUTIVE KPIS */}
      <Card className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900">
                  Registre Cumulé & Bilan d'Assiduité Mensuel
                </h1>
                <p className="text-[11px] text-slate-500">
                  Suivi des absences cumulées, retards et assiduité sur le mois en cours
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-3.5 h-3.5 text-brand-600" />}
            >
              Exporter Excel (CSV)
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmResetOpen(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Séances Archivées
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-0.5">
              {overallTotals.sessionsCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Toutes classes confondues
            </div>
          </div>

          <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-emerald-800">
              Taux d'Assiduité Global
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums mt-0.5">
              {overallTotals.globalRate}%
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">
              Présences effectives
            </div>
          </div>

          <div className="bg-rose-50/40 border border-rose-200/70 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-rose-800">
              Total Absences Cumulées
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 tabular-nums mt-0.5">
              {overallTotals.totalAbsents}
            </div>
            <div className="text-[10px] text-rose-600 mt-0.5">
              Heures non justifiées
            </div>
          </div>

          <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-amber-800">
              Total Retards Cumulés
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-700 tabular-nums mt-0.5">
              {overallTotals.totalRetards}
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5">
              Arrivées tardives
            </div>
          </div>
        </div>
      </Card>

      {/* 2. FILTER TABS & SEARCH */}
      <Card className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedClassFilter("ALL")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              selectedClassFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
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
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cls} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un élève, tuteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>
      </Card>

      {/* 3. CUMULATIVE STUDENTS TABLE */}
      <Card className="overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="sm:col-span-1 text-center">#</div>
          <div className="sm:col-span-4">Élève & Classe</div>
          <div className="sm:col-span-3">Contact Tuteur</div>
          <div className="sm:col-span-2 text-center">Bilan Cumulé</div>
          <div className="sm:col-span-2 text-right">Assiduité & Vigilance</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => {
              const stats = studentStats[student.id] || {
                absent: 0,
                retard: 0,
                present: 0,
                totalSessions: 0,
                rate: 100,
              };
              const isCritical = stats.absent >= 3;
              const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:px-4 sm:py-3 transition-colors flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 sm:gap-3 hover:bg-slate-50/80 ${
                    isCritical ? "bg-rose-50/20" : ""
                  }`}
                >
                  {/* Col 0: Index */}
                  <div className="hidden sm:block sm:col-span-1 text-center text-xs font-mono text-slate-400">
                    {idx + 1}
                  </div>

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
                        <Badge variant="neutral">{student.classLevel}</Badge>
                      </div>

                      {/* Mobile parent display */}
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

                  {/* Col 3: Absences & Retards Pills */}
                  <div className="sm:col-span-2 flex items-center sm:justify-center gap-1.5 flex-wrap">
                    <Badge variant={stats.absent > 0 ? "danger" : "neutral"}>
                      {stats.absent} abs.
                    </Badge>
                    <Badge variant={stats.retard > 0 ? "warning" : "neutral"}>
                      {stats.retard} ret.
                    </Badge>
                  </div>

                  {/* Col 4: Assiduité Rate & Vigilance */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                    <div className="text-right">
                      <div
                        className={`text-xs font-black tabular-nums ${
                          stats.rate < 75
                            ? "text-rose-600"
                            : stats.rate < 90
                            ? "text-amber-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {stats.rate}%
                      </div>
                      <div className="text-[10px] text-slate-400">Assiduité</div>
                    </div>

                    {isCritical ? (
                      <Badge variant="danger" dot dotPulse>
                        Vigilance (≥3)
                      </Badge>
                    ) : (
                      <Badge variant="success">Régulier</Badge>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucun élève trouvé pour cette classe ou recherche.
            </div>
          )}
        </div>
      </Card>

      {/* 4. RESET CONFIRMATION MODAL */}
      <Modal
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        title="Réinitialiser le registre mensuel ?"
        description="Cette action est irréversible et effacera l'historique des séances archivées."
        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        maxWidth="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmResetOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReset}
            >
              Confirmer la réinitialisation
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Toutes les séances archivées du mois en cours seront effacées. Les fiches d'élèves actuelles seront conservées.
        </p>
      </Modal>

    </div>
  );
};
