"use client";

import React from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Building,
  GraduationCap,
  X,
} from "lucide-react";
import { AppView } from "@/types";

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  schoolName: string;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  schoolName,
  onOpenImport,
  onOpenSettings,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: "DASHBOARD" as AppView,
      label: "Tableau de bord",
      icon: LayoutDashboard,
      badge: "Principal",
    },
    {
      id: "ATTENDANCE" as AppView,
      label: "Faire l'appel",
      icon: ClipboardCheck,
      badge: "Pointage",
    },
    {
      id: "REGISTER" as AppView,
      label: "Registre mensuel",
      icon: BarChart3,
      badge: "Bilan",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Branding */}
        <div>
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
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
                  Gestion Scolaire SaaS
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 lg:hidden"
              aria-label="Fermer la navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Espace de Travail
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? "bg-navy-900 text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}

            <div className="pt-3 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Outils & Configuration
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
              <span>Importer Élèves (CSV)</span>
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
              <span>Paramètres École</span>
            </button>
          </div>
        </div>

        {/* Bottom: Active School & Profile Card */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2">
          <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Building className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {schoolName}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Année 2025-2026 • S2
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span>Surveillance Générale</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="En ligne"></span>
          </div>
        </div>
      </aside>
    </>
  );
};
