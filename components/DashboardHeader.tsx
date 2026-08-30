"use client";

import React from "react";
import {
  Menu,
  Calendar,
  Clock,
  FileSpreadsheet,
  Settings,
  Bell,
  Search,
} from "lucide-react";

interface DashboardHeaderProps {
  schoolName: string;
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  timeSlots: readonly string[];
  currentDateFormatted: string;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenMobileMenu: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  schoolName,
  selectedSlot,
  onSlotChange,
  timeSlots,
  currentDateFormatted,
  onOpenImport,
  onOpenSettings,
  onOpenMobileMenu,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
      <div className="px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Toggle & Context */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[280px]">
              {schoolName}
            </span>
          </div>
        </div>

        {/* Right: Date, Slot & Administrative Actions */}
        <div className="flex items-center gap-2 text-xs">
          {/* Date & Slot (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">{currentDateFormatted}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedSlot}
                onChange={(e) => onSlotChange(e.target.value)}
                aria-label="Créneau horaire"
                className="bg-transparent text-slate-700 font-medium cursor-pointer focus:outline-none"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Import Button */}
          <button
            type="button"
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs active:scale-95"
            title="Importer une liste d'élèves (CSV / Excel)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden md:inline">Importer</span>
          </button>

          {/* Quick Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs active:scale-95"
            title="Paramètres de l'école et modèles d'alertes"
            aria-label="Paramètres"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
