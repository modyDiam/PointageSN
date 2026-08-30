"use client";

import React, { useState } from "react";
import {
  X,
  Settings,
  RotateCcw,
  Check,
  Building,
  MessageSquare,
  Sparkles,
  Eye,
} from "lucide-react";
import { SchoolSettings } from "@/types";
import { DEFAULT_ABSENT_TEMPLATE, DEFAULT_RETARD_TEMPLATE, formatTemplate } from "@/utils/whatsapp";

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
  const [previewType, setPreviewType] = useState<"ABSENT" | "RETARD">("ABSENT");

  if (!isOpen) return null;

  const demoSampleStudent = {
    id: "sample",
    firstName: "Moussa",
    lastName: "Diop",
    classLevel: "6e A",
    parentName: "Mamadou Diop",
    parentPhone: "221777501565",
  };

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
    onShowToast("Modèles WhatsApp par défaut rétablis", "info");
  };

  const currentPreviewText = formatTemplate(
    previewType === "ABSENT" ? absentTemplate : retardTemplate,
    demoSampleStudent,
    schoolName || "Lycée d'Excellence Birago Diop"
  );

  const insertVariable = (variable: string, target: "absent" | "retard") => {
    if (target === "absent") {
      setAbsentTemplate((prev) => prev + " " + variable);
    } else {
      setRetardTemplate((prev) => prev + " " + variable);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden animate-scale-up my-6">
        
        {/* Header */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Configuration de l'Établissement
              </h2>
              <p className="text-[11px] text-slate-500">
                Personnalisez le nom officiel et les modèles des alertes WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          
          {/* Nom de l'établissement */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Nom de l'établissement scolaire</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="Ex: Lycée d'Excellence Birago Diop"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
              required
            />
          </div>

          {/* Variable chips */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center gap-1 font-semibold text-slate-700 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Variables automatiques disponibles :</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: "{Ecole}", label: "Nom école" },
                { tag: "{Parent}", label: "Nom tuteur" },
                { tag: "{Eleve}", label: "Nom élève" },
                { tag: "{Classe}", label: "Classe" },
              ].map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => insertVariable(item.tag, previewType === "ABSENT" ? "absent" : "retard")}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono transition"
                  title={`Cliquer pour insérer ${item.tag}`}
                >
                  <strong className="text-brand-600">{item.tag}</strong>{" "}
                  <span className="text-slate-400">({item.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Absences */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-700">
                <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                Modèle d'alerte • Absence injustifiée
              </span>
              <button
                type="button"
                onClick={() => setPreviewType("ABSENT")}
                className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  previewType === "ABSENT" ? "bg-rose-50 text-rose-700 font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Aperçu 👁️
              </button>
            </label>
            <textarea
              rows={3}
              value={absentTemplate}
              onChange={(e) => setAbsentTemplate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition leading-relaxed"
              required
            />
          </div>

          {/* Template Retards */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-700">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                Modèle d'alerte • Retard constaté
              </span>
              <button
                type="button"
                onClick={() => setPreviewType("RETARD")}
                className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  previewType === "RETARD" ? "bg-amber-50 text-amber-700 font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                Aperçu 👁️
              </button>
            </label>
            <textarea
              rows={3}
              value={retardTemplate}
              onChange={(e) => setRetardTemplate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition leading-relaxed"
              required
            />
          </div>

          {/* Real-time WhatsApp Message Preview */}
          <div className="bg-[#f0f2f5] border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1 text-[#128C7E]">
                <Eye className="w-3.5 h-3.5" />
                <span>Rendu direct WhatsApp ({previewType === "ABSENT" ? "Absence" : "Retard"}) :</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Destinataire : +221 77 750 15 65</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg shadow-2xs text-slate-800 text-[11px] leading-relaxed border border-slate-100 font-sans">
              {currentPreviewText}
            </div>
          </div>

          {/* Footer Actions inside form */}
          <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Modèles par défaut</span>
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
                className="px-4 py-1.5 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
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
