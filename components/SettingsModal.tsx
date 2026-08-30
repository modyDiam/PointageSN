"use client";

import React, { useState } from "react";
import { X, Settings, RotateCcw, Check, Sparkles, Building, MessageSquare } from "lucide-react";
import { SchoolSettings } from "@/types";
import { DEFAULT_ABSENT_TEMPLATE, DEFAULT_RETARD_TEMPLATE } from "@/utils/whatsapp";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSaveSettings: (newSettings: SchoolSettings) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onShowToast,
}) => {
  const [schoolName, setSchoolName] = useState<string>(settings.schoolName);
  const [absentTemplate, setAbsentTemplate] = useState<string>(settings.absentTemplate);
  const [retardTemplate, setRetardTemplate] = useState<string>(settings.retardTemplate);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      schoolName: schoolName.trim() || "Lycée d'Excellence Birago Diop",
      absentTemplate: absentTemplate.trim() || DEFAULT_ABSENT_TEMPLATE,
      retardTemplate: retardTemplate.trim() || DEFAULT_RETARD_TEMPLATE,
    });
    onShowToast("Paramètres enregistrés avec succès ! ✨", "success");
    onClose();
  };

  const handleResetDefaults = () => {
    setAbsentTemplate(DEFAULT_ABSENT_TEMPLATE);
    setRetardTemplate(DEFAULT_RETARD_TEMPLATE);
    onShowToast("Modèles par défaut rétablis", "info");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-scale-up my-6">
        
        {/* Header */}
        <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Paramètres de l'Établissement
              </h2>
              <p className="text-[11px] text-slate-500">
                Personnalisation de l'école et des alertes WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nom de l'école */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Nom de l'établissement scolaire :</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Ex: Lycée d'Excellence Birago Diop"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
              required
            />
          </div>

          {/* Variables Info Tag */}
          <div className="bg-slate-100/70 border border-slate-200/60 rounded-xl p-2.5 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Variables dynamiques utilisables dans les messages :</span>
            </div>
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600">{"{Ecole}"}</span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600">{"{Parent}"}</span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600">{"{Eleve}"}</span>
              <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600">{"{Classe}"}</span>
            </div>
          </div>

          {/* Template Absences */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
              <span>Modèle d'alerte WhatsApp (Absence) :</span>
            </label>
            <textarea
              rows={3}
              value={absentTemplate}
              onChange={(e) => setAbsentTemplate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition leading-relaxed"
              required
            />
          </div>

          {/* Template Retards */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Modèle d'alerte WhatsApp (Retard) :</span>
            </label>
            <textarea
              rows={3}
              value={retardTemplate}
              onChange={(e) => setRetardTemplate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition leading-relaxed"
              required
            />
          </div>

          {/* Footer inside form */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Rétablir messages par défaut</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
