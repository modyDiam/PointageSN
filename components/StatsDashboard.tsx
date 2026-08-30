"use client";

import React from "react";
import { Users, UserCheck, UserX, ClockAlert, CheckCheck, RotateCcw } from "lucide-react";
import { ClassStats } from "@/types";

interface StatsDashboardProps {
  stats: ClassStats;
  onMarkAllPresent: () => void;
  onResetClassAttendance: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  onMarkAllPresent,
  onResetClassAttendance,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all">
      {/* Header bar of Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>Tableau de bord en temps réel</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
              Taux : {stats.attendanceRate}%
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suivi instantané des présences, absences et retards de la séance
          </p>
        </div>

        {/* Quick batch actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllPresent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/50 text-xs font-semibold transition shadow-sm active:scale-95"
            title="Marquer tous les élèves de la classe comme Présent"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tout Présent</span>
          </button>

          <button
            type="button"
            onClick={onResetClassAttendance}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs font-medium transition active:scale-95"
            title="Réinitialiser le pointage de cette classe"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Élèves */}
        <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 shrink-0 border border-slate-700/50">
            <Users className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Classe
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {stats.total}
            </div>
          </div>
        </div>

        {/* Présents */}
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-300 shrink-0 border border-emerald-600/50">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-wider">
              Présents
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300">
              {stats.present}
            </div>
          </div>
        </div>

        {/* Absents (Badge Rouge) */}
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 sm:p-3.5 flex items-center gap-3 relative overflow-hidden">
          {stats.absent > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 rounded-bl bg-rose-500 animate-ping"></div>
          )}
          <div className="w-10 h-10 rounded-xl bg-rose-900/60 flex items-center justify-center text-rose-300 shrink-0 border border-rose-600/50 shadow-lg shadow-rose-950/50">
            <UserX className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <span>Absents</span>
              {stats.absent > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  !
                </span>
              )}
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              {stats.absent}
            </div>
          </div>
        </div>

        {/* Retards (Badge Orange) */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 sm:p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900/60 flex items-center justify-center text-amber-300 shrink-0 border border-amber-600/50">
            <ClockAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider">
              Retards
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {stats.retard}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar of Attendance */}
      <div className="mt-4 pt-2">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
          <span>Assiduité de la classe</span>
          <span className="font-semibold text-slate-300">
            {stats.present + stats.retard} / {stats.total} présents & retards
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${stats.total ? (stats.present / stats.total) * 100 : 0}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`Présents: ${stats.present}`}
          />
          <div
            style={{ width: `${stats.total ? (stats.retard / stats.total) * 100 : 0}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Retards: ${stats.retard}`}
          />
          <div
            style={{ width: `${stats.total ? (stats.absent / stats.total) * 100 : 0}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`Absents: ${stats.absent}`}
          />
        </div>
      </div>
    </div>
  );
};
