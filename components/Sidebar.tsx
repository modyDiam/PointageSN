"use client";

import React from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  UserX,
  Clock,
  FileSpreadsheet,
  Settings,
  FileText,
  Building,
  GraduationCap,
  X,
  User,
  ShieldCheck,
} from "lucide-react";
import { AppView } from "@/types";

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  schoolName: string;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  absentCount?: number;
  retardCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  schoolName,
  onOpenImport,
  onOpenSettings,
  onOpenReport,
  isMobileOpen,
  onCloseMobile,
  absentCount = 0,
  retardCount = 0,
}) => {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Section */}
        <div className="flex-1 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-xs relative">
                <span>PSN</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1"></span>
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                  Pointage<span className="text-brand-600">SN</span>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                  SaaS Scolaire Sénégal
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 lg:hidden"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items Group 1: ESPACE PRINCIPAL */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Espace de Travail
            </div>

            {/* Tableau de bord */}
            <button
              type="button"
              onClick={() => {
                onNavigate("DASHBOARD");
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                currentView === "DASHBOARD"
                  ? "bg-slate-100 text-slate-900 font-bold border-l-2 border-navy-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard
                  className={`w-4 h-4 ${
                    currentView === "DASHBOARD" ? "text-brand-600" : "text-slate-400"
                  }`}
                />
                <span>Tableau de bord</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-600 font-mono">
                Général
              </span>
            </button>

            {/* Faire l'appel */}
            <button
              type="button"
              onClick={() => {
                onNavigate("ATTENDANCE");
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                currentView === "ATTENDANCE"
                  ? "bg-slate-100 text-slate-900 font-bold border-l-2 border-navy-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardCheck
                  className={`w-4 h-4 ${
                    currentView === "ATTENDANCE" ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <span>Faire l'appel</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                Pointage
              </span>
            </button>
          </div>

          {/* Nav Items Group 2: SUIVI & REGISTRES */}
          <div className="p-3 pt-1 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Suivi & Assiduité
            </div>

            {/* Registre du mois */}
            <button
              type="button"
              onClick={() => {
                onNavigate("REGISTER");
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                currentView === "REGISTER"
                  ? "bg-slate-100 text-slate-900 font-bold border-l-2 border-navy-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3
                  className={`w-4 h-4 ${
                    currentView === "REGISTER" ? "text-brand-600" : "text-slate-400"
                  }`}
                />
                <span>Registre mensuel</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-600 font-mono">
                Bilan
              </span>
            </button>

            {/* Suivi des Absences */}
            <button
              type="button"
              onClick={() => {
                onNavigate("REGISTER");
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border-l-2 border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <UserX className="w-4 h-4 text-rose-500" />
                <span>Absences signalées</span>
              </div>
              {absentCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200/60">
                  {absentCount}
                </span>
              )}
            </button>

            {/* Arrivées Tardives */}
            <button
              type="button"
              onClick={() => {
                onNavigate("REGISTER");
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border-l-2 border-transparent"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Arrivées tardives</span>
              </div>
              {retardCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200/60">
                  {retardCount}
                </span>
              )}
            </button>

            {/* Rapport de Séance */}
            <button
              type="button"
              onClick={() => {
                onOpenReport();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border-l-2 border-transparent"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Rapport de séance</span>
            </button>
          </div>

          {/* Nav Items Group 3: ADMINISTRATION & CONFIGURATION */}
          <div className="p-3 pt-1 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Outils & Administration
            </div>

            {/* Importer CSV */}
            <button
              type="button"
              onClick={() => {
                onOpenImport();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-600" />
              <span>Élèves & Classes (CSV)</span>
            </button>

            {/* Paramètres */}
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Paramètres Établissement</span>
            </button>
          </div>
        </div>

        {/* Bottom Section: Active School & User Session Card */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/60 space-y-2 shrink-0">
          <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Building className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {schoolName}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Sénégal • Année 2025-2026
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
              <span>Session active</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">v1.0 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};
