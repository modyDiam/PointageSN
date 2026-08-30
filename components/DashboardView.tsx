"use client";

import React, { useMemo } from "react";
import {
  Student,
  AttendanceRecord,
  AttendanceSession,
  AppView,
  SchoolSettings,
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

  // Recent activity logs built from actual history and current state
  const recentActivities = useMemo(() => {
    const activities = [];

    // Latest session from history if exists
    if (historySessions.length > 0) {
      const latest = historySessions[0];
      activities.push({
        id: "act-latest-sess",
        title: `Appel clôturé • Classe ${latest.classLevel}`,
        desc: `Séance enregistrée pour le créneau ${latest.slot} (${latest.date})`,
        time: "Récemment",
        icon: ClipboardCheck,
        badge: "Validé",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      });
    }

    // Current absentees alert log
    if (globalStats.absent > 0) {
      activities.push({
        id: "act-absent-alert",
        title: `${globalStats.absent} absence(s) constatée(s)`,
        desc: "Notifications parentales prêtes à être envoyées via WhatsApp",
        time: "Aujourd'hui",
        icon: UserX,
        badge: "À notifier",
        badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      });
    }

    // Retard log
    if (globalStats.retard > 0) {
      activities.push({
        id: "act-retard-alert",
        title: `${globalStats.retard} retard(s) enregistré(s)`,
        desc: "Arrivées tardives signalées pour la séance en cours",
        time: "Aujourd'hui",
        icon: Clock,
        badge: "Retard",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      });
    }

    // Default base logs
    activities.push({
      id: "act-students-sync",
      title: "Effectifs synchronisés",
      desc: `${students.length} élèves actifs dans la base de données scolaire`,
      time: "Aujourd'hui",
      icon: Users,
      badge: "Actif",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
    });

    return activities;
  }, [historySessions, globalStats, students.length]);

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* 1. Page Title & Administrative Context */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Tableau de Bord • Vue d'ensemble
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold">
              En direct
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi instantané des présences, des alertes parentales et des classes de l'établissement.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onNavigate("ATTENDANCE")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Faire l'appel</span>
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Statistics (4 Sobres Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* Card 1: Total Élèves */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Élèves Inscrits
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
            {globalStats.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{availableClasses.length} classe(s) active(s)</span>
          </div>
        </div>

        {/* Card 2: Présents Aujourd'hui */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Présents Aujourd'hui
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums tracking-tight">
            {globalStats.present}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <span>Taux de présence : {globalStats.attendanceRate}%</span>
          </div>
        </div>

        {/* Card 3: Absents Aujourd'hui */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Absents Aujourd'hui
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 tabular-nums tracking-tight">
            {globalStats.absent}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
            <span>{globalStats.absent > 0 ? `${globalStats.absent} alerte(s) à envoyer` : "Aucune absence"}</span>
          </div>
        </div>

        {/* Card 4: Retards Aujourd'hui */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Retards Aujourd'hui
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 tabular-nums tracking-tight">
            {globalStats.retard}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Créneau : {selectedSlot}</span>
          </div>
        </div>

      </div>

      {/* 3. Main Grid: Presence by Class + Activity & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* Left 2 Cols: Présence Aujourd'hui par Classe */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Présence par Classe • En Direct
                </h2>
                <p className="text-[11px] text-slate-500">
                  Visualisation du taux d'assiduité par division
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">
                {currentDateFormatted}
              </span>
            </div>

            {/* Class Cards */}
            <div className="space-y-2.5">
              {classBreakdowns.map((item) => (
                <div
                  key={item.className}
                  className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Class Info & Rate */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          Classe {item.className}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({item.total} élève{item.total > 1 ? "s" : ""})
                        </span>
                      </div>

                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {item.rate}% assiduité
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${(item.present / item.total) * 100 || 0}%` }}
                        className="bg-emerald-500 h-full transition-all duration-300"
                        title={`${item.present} présent(s)`}
                      />
                      <div
                        style={{ width: `${(item.retard / item.total) * 100 || 0}%` }}
                        className="bg-amber-400 h-full transition-all duration-300"
                        title={`${item.retard} retard(s)`}
                      />
                      <div
                        style={{ width: `${(item.absent / item.total) * 100 || 0}%` }}
                        className="bg-rose-500 h-full transition-all duration-300"
                        title={`${item.absent} absent(s)`}
                      />
                    </div>

                    {/* Sub Badges */}
                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="text-emerald-700 font-semibold">
                        {item.present} présent{item.present > 1 ? "s" : ""}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-rose-700 font-semibold">
                        {item.absent} absent{item.absent > 1 ? "s" : ""}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-700 font-semibold">
                        {item.retard} retard{item.retard > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Direct Call Button */}
                  <button
                    type="button"
                    onClick={() => onSelectClassAndCall(item.className)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg transition active:scale-95 shadow-2xs shrink-0"
                  >
                    <span>Pointage</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Actions Rapides & Outils
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onNavigate("ATTENDANCE")}
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-200 rounded-xl transition text-center group"
              >
                <ClipboardCheck className="w-5 h-5 text-brand-600 mb-1 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Faire l'appel</span>
                <span className="text-[10px] text-slate-400">Pointage direct</span>
              </button>

              <button
                type="button"
                onClick={onOpenImport}
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-200 rounded-xl transition text-center group"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Importer</span>
                <span className="text-[10px] text-slate-400">CSV / Excel</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("REGISTER")}
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-200 rounded-xl transition text-center group"
              >
                <BarChart3 className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Registre</span>
                <span className="text-[10px] text-slate-400">Cumul mensuel</span>
              </button>

              <button
                type="button"
                onClick={onOpenReport}
                className="flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-200 rounded-xl transition text-center group"
              >
                <FileText className="w-5 h-5 text-slate-700 mb-1 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Rapport</span>
                <span className="text-[10px] text-slate-400">Synthèse séance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Activité Récente & Journal de Vie Scolaire */}
        <div className="space-y-3.5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Activité Récente
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Journal
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {act.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${act.badgeColor} shrink-0`}>
                          {act.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        {act.desc}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
                        {act.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* School Contact Quick Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Building className="w-4 h-4 text-slate-500" />
              <span>{schoolName}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Les notifications d'absence sont instantanément transmises aux tuteurs sénégalais via l'API WhatsApp officielle.
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 text-[11px]">
              <span className="text-slate-500">Modèles WhatsApp</span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-brand-600 hover:text-brand-700 font-bold"
              >
                Personnaliser ⚙️
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
