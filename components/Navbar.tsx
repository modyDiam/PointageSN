"use client";

import React from "react";
import {
  ClipboardCheck,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Clock,
  Calendar,
  Building,
} from "lucide-react";

interface NavbarProps {
  activeView: "DAILY" | "MONTHLY";
  onViewChange: (view: "DAILY" | "MONTHLY") => void;
  schoolName: string;
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  timeSlots: readonly string[];
  currentDateFormatted: string;
  onOpenImport: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  schoolName,
  selectedSlot,
  onSlotChange,
  timeSlots,
  currentDateFormatted,
  onOpenImport,
  onOpenSettings,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
        
        {/* Left: Brand Logomark & View Navigation */}
        <div className="flex items-center gap-3.5">
          {/* Logo Mark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-xs relative">
              <span>PSN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1"></span>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Pointage<span className="text-brand-600">SN</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Vie Scolaire
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          {/* View Switcher: Pointage vs Registre */}
          <nav className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70" aria-label="Navigation principale">
            <button
              type="button"
              onClick={() => onViewChange("DAILY")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeView === "DAILY"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Pointage</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange("MONTHLY")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeView === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
              <span>Registre mensuel</span>
            </button>
          </nav>
        </div>

        {/* Right: Date, Time slot & Administrative Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          {/* Time & Slot Indicator (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
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

          {/* Import CSV Button */}
          <button
            type="button"
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs active:scale-95"
            title="Importer une liste d'élèves par fichier CSV / Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Importer</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition shadow-2xs active:scale-95"
            title="Paramètres de l'établissement et modèles WhatsApp"
            aria-label="Ouvrir les paramètres"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
