"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Calendar,
  Clock,
  FileSpreadsheet,
  Settings,
  User,
  ShieldCheck,
  Building,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Student, AttendanceRecord, AttendanceSession, AppView } from "@/types";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

interface DashboardHeaderProps {
  schoolName: string;
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  timeSlots: readonly string[];
  currentDateFormatted: string;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenMobileMenu: () => void;
  students: Student[];
  attendance: AttendanceRecord;
  historySessions: AttendanceSession[];
  currentView: AppView;
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
  students,
  attendance,
  historySessions,
  currentView,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const viewTitles: Record<AppView, string> = {
    DASHBOARD: "Vue d'ensemble",
    ATTENDANCE: "Prise d'Appel",
    REGISTER: "Registre Mensuel",
    STUDENTS: "Gestion des Élèves",
    REPORTS: "Rapports & Documents",
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
      <div className="px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
        
        {/* Left: Mobile Toggle & Context Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle shrink-0"></span>
            <div className="flex items-center gap-1.5 text-xs truncate">
              <span className="font-bold text-slate-800 truncate">
                {schoolName}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[10px] hidden sm:inline border border-slate-200/60">
                {viewTitles[currentView]}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Time, Notifications, User Menu */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          {/* Date & Slot Picker (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl">
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition shadow-2xs active:scale-95"
            title="Importer une liste d'élèves (CSV / Excel)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />
            <span>Importer</span>
          </button>

          {/* Real-time Notifications Popover Dropdown */}
          <NotificationsDropdown
            students={students}
            attendance={attendance}
            historySessions={historySessions}
            schoolName={schoolName}
          />

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition shadow-2xs active:scale-95"
            title="Paramètres de l'école et modèles d'alertes"
            aria-label="Paramètres"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition shadow-2xs"
              aria-label="Menu profil utilisateur"
            >
              <div className="w-6 h-6 rounded-lg bg-navy-900 text-white font-bold text-[10px] flex items-center justify-center">
                SG
              </div>
              <span className="hidden lg:inline font-bold text-xs text-slate-800">
                Surveillance
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-modal z-50 overflow-hidden animate-scale-up">
                <div className="p-3 border-b border-slate-100 bg-slate-50/80">
                  <div className="font-bold text-xs text-slate-900">
                    Surveillance Générale
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {schoolName}
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettings();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Paramètres Établissement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenImport();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />
                    <span>Gestion des Élèves (CSV)</span>
                  </button>
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-center text-slate-400">
                  PointageSN • Session Sécurisée
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
