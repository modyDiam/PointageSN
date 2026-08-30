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
    <div className="w-full space-y-3">
      {/* Header bar of Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Aperçu de la séance</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Assiduité : {stats.attendanceRate}%
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Suivi instantané des présences, absences et retards
          </p>
        </div>

        {/* Quick batch actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllPresent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs active:scale-95"
            title="Marquer tous les élèves de la classe comme Présent"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tout Présent</span>
          </button>

          <button
            type="button"
            onClick={onResetClassAttendance}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium transition active:scale-95"
            title="Réinitialiser le pointage de cette classe"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Total Élèves (fond blanc, chiffre slate-900) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Élèves
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Effectif inscrit</p>
        </div>

        {/* 2. Présents (carte émeraude subtile) */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Présents
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {stats.present}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">En classe</p>
        </div>

        {/* 3. Absences déclarées (carte rose/rouge subtile) */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          {stats.absent > 0 && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          )}
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Absents
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100/80 flex items-center justify-center text-rose-700">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-700">
            {stats.absent}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-0.5">À notifier</p>
        </div>

        {/* 4. Retards (carte ambre subtile) */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Retards
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-700">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">
            {stats.retard}
          </div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Arrivées tardives</p>
        </div>
      </div>

      {/* Modern Jauge d'assiduité */}
      <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Progression d'assiduité :</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Présents ({stats.present})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Retards ({stats.retard})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Absents ({stats.absent})</span>
          </div>
        </div>

        <div className="w-full sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${stats.total ? (stats.present / stats.total) * 100 : 0}%` }}
            className="bg-emerald-500 transition-all duration-300"
          />
          <div
            style={{ width: `${stats.total ? (stats.retard / stats.total) * 100 : 0}%` }}
            className="bg-amber-500 transition-all duration-300"
          />
          <div
            style={{ width: `${stats.total ? (stats.absent / stats.total) * 100 : 0}%` }}
            className="bg-rose-500 transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
};
