"use client";

import React, { useMemo } from "react";
import {
  Student,
  AttendanceRecord,
  AttendanceSession,
  AppView,
} from "@/types";
import {
  Users,
  CheckCircle2,
  UserX,
  Clock,
  ArrowRight,
  ClipboardCheck,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Settings,
  ShieldAlert,
  Calendar,
  Activity,
  MessageSquare,
  Building,
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";

interface DashboardViewProps {
  students: Student[];
  availableClasses: string[];
  attendance: AttendanceRecord;
  historySessions: AttendanceSession[];
  schoolName: string;
  selectedSlot: string;
  currentDateFormatted: string;
  onNavigate: (view: AppView) => void;
  onSelectClassAndCall: (className: string) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  availableClasses,
  attendance,
  historySessions,
  schoolName,
  selectedSlot,
  currentDateFormatted,
  onNavigate,
  onSelectClassAndCall,
  onOpenImport,
  onOpenSettings,
  onOpenReport,
}) => {
  // Global Live Attendance Stats across all classes
  const globalStats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let retard = 0;

    students.forEach((s) => {
      const status = attendance[s.id] || "PRESENT";
      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "RETARD") retard++;
    });

    const attendanceRate =
      total > 0 ? Math.round(((present + retard) / total) * 100) : 100;

    return { total, present, absent, retard, attendanceRate };
  }, [students, attendance]);

  // Breakdown stats by class
  const classBreakdowns = useMemo(() => {
    return availableClasses.map((className) => {
      const classStudents = students.filter((s) => s.classLevel === className);
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

      const rate =
        total > 0 ? Math.round(((present + retard) / total) * 100) : 100;

      return {
        className,
        total,
        present,
        absent,
        retard,
        rate,
      };
    });
  }, [students, availableClasses, attendance]);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* 1. EXECUTIVE KPI CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Inscrits */}
        <Card className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Inscrits
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {globalStats.total}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">
              {availableClasses.length} classe(s)
            </span>
            <span>• Année 2025-2026</span>
          </div>
        </Card>

        {/* Card 2: Présents Aujourd'hui */}
        <Card className="p-3.5 sm:p-4 bg-emerald-50/20 border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Présents
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
              {globalStats.present}
            </div>
            <div className="text-xs font-bold text-emerald-700">
              ({globalStats.attendanceRate}%)
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Assiduité de séance</span>
          </div>
        </Card>

        {/* Card 3: Absents Aujourd'hui */}
        <Card className="p-3.5 sm:p-4 bg-rose-50/20 border-rose-200/80">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Absents
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 tabular-nums">
            {globalStats.absent}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            {globalStats.absent > 0 ? "Alertes WhatsApp prêtes" : "Aucune absence signalée"}
          </div>
        </Card>

        {/* Card 4: Retards Aujourd'hui */}
        <Card className="p-3.5 sm:p-4 bg-amber-50/20 border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Retards
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 tabular-nums">
            {globalStats.retard}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {globalStats.retard > 0 ? "Arrivées tardives constatées" : "Aucun retard enregistré"}
          </div>
        </Card>
      </div>

      {/* 2. LIVE PRESENCE BY CLASS BREAKDOWN (CORE SAAS SECTION) */}
      <Card className="overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
            <h2 className="font-bold text-xs sm:text-sm text-slate-900">
              Présence en Direct par Classe • {selectedSlot}
            </h2>
          </div>

          <Button
            variant="primary"
            size="xs"
            onClick={() => onNavigate("ATTENDANCE")}
            rightIcon={<ArrowRight className="w-3 h-3" />}
          >
            Faire l'appel
          </Button>
        </div>

        {/* Class Cards Grid */}
        <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {classBreakdowns.map((item) => (
            <div
              key={item.className}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-sm text-slate-900">
                    Classe {item.className}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {item.total} élève(s) inscrits
                  </div>
                </div>

                <Badge variant={item.rate === 100 ? "success" : "neutral"}>
                  {item.rate}% assiduité
                </Badge>
              </div>

              {/* Progress Tri-color Bar */}
              <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${item.total > 0 ? (item.present / item.total) * 100 : 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`${item.present} Présents`}
                />
                <div
                  style={{ width: `${item.total > 0 ? (item.retard / item.total) * 100 : 0}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`${item.retard} Retards`}
                />
                <div
                  style={{ width: `${item.total > 0 ? (item.absent / item.total) * 100 : 0}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`${item.absent} Absents`}
                />
              </div>

              {/* Metrics row + Direct Pointage button */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">{item.present} P</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-700 font-bold">{item.retard} R</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-700 font-bold">{item.absent} A</span>
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onSelectClassAndCall(item.className)}
                  className="text-brand-600 hover:text-brand-700 font-bold"
                >
                  Pointage ↗
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. LOWER TWO-COLUMN: RECENT ACTIVITY FEED + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Left Col (8/12): Live Feed & Alerts Summary */}
        <Card className="lg:col-span-8 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Activité & Suivi Récent de l'Établissement
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Direct live
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Event 1 */}
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    Session de pointage synchronisée
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Aujourd'hui
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pointage effectué pour les classes de {availableClasses.join(", ")}. Données stockées localement.
                </p>
              </div>
            </div>

            {/* Event 2 */}
            {globalStats.absent > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50/40 border border-rose-200/60 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">
                      {globalStats.absent} élève(s) absent(s) non notifiés
                    </span>
                    <span className="text-[10px] text-rose-500 font-bold">
                      Alerte active
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Utilisez le module Pointage pour notifier directement les tuteurs par WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* Event 3 */}
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                🏫
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {schoolName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    2025-2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Modèles d'alertes WhatsApp configurés avec format officiel Sénégal.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Col (4/12): Quick Actions Hub */}
        <Card className="lg:col-span-4 p-4 space-y-3">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Actions Administratives
            </h3>
          </div>

          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("REGISTER")}
              leftIcon={<BarChart3 className="w-4 h-4 text-brand-600" />}
              className="w-full justify-start"
            >
              Registre & Bilan Mensuel
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("REPORTS")}
              leftIcon={<FileText className="w-4 h-4 text-slate-700" />}
              className="w-full justify-start"
            >
              Rapports & Export PDF A4
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenImport}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-brand-600" />}
              className="w-full justify-start"
            >
              Importer une classe (CSV)
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenSettings}
              leftIcon={<Settings className="w-4 h-4 text-slate-500" />}
              className="w-full justify-start"
            >
              Paramètres Établissement
            </Button>
          </div>
        </Card>

      </div>

    </div>
  );
};
