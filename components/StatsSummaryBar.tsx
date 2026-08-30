"use client";

import React from "react";
import { ClassStats } from "@/types";
import { CheckCheck, Search, X } from "lucide-react";

interface StatsSummaryBarProps {
  stats: ClassStats;
  onMarkAllPresent: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const StatsSummaryBar: React.FC<StatsSummaryBarProps> = ({
  stats,
  onMarkAllPresent,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Metric Badges */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
          <span className="text-slate-400">Total :</span>
          <strong className="text-slate-900 font-bold tabular-nums">{stats.total}</strong>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Présents :</span>
          <strong className="tabular-nums">{stats.present}</strong>
          <span className="text-[10px] opacity-75 tabular-nums">({stats.attendanceRate}%)</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50/80 border border-rose-200/70 text-rose-800 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Absents :</span>
          <strong className="tabular-nums">{stats.absent}</strong>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50/80 border border-amber-200/70 text-amber-800 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Retards :</span>
          <strong className="tabular-nums">{stats.retard}</strong>
        </div>
      </div>

      {/* Right: Search & Batch Action */}
      <div className="flex items-center gap-2 self-stretch sm:self-auto">
        {/* Search input */}
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer un élève..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mark all present button */}
        <button
          type="button"
          onClick={onMarkAllPresent}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition active:scale-95 whitespace-nowrap shrink-0"
          title="Marquer tous les élèves de cette classe comme Présent"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Tout Présent</span>
        </button>
      </div>
    </div>
  );
};
