"use client";

import React, { useState } from "react";
import {
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
import { Modal, Input, Button, Badge } from "@/components/ui";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration de l'Établissement"
      description="Personnalisez le nom officiel et les modèles des alertes WhatsApp"
      icon={<Settings className="w-4 h-4" />}
      maxWidth="lg"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Rétablir modèles par défaut
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              onClick={handleSave}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Enregistrer
            </Button>
          </div>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Nom de l'établissement */}
        <Input
          label="Nom de l'établissement scolaire"
          required
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="Ex: Lycée d'Excellence Birago Diop"
          leftIcon={<Building className="w-3.5 h-3.5 text-slate-400" />}
        />

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
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 text-rose-700">
              <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
              <span>Modèle d'alerte • Absence injustifiée</span>
            </label>
            <button
              type="button"
              onClick={() => setPreviewType("ABSENT")}
              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                previewType === "ABSENT" ? "bg-rose-50 text-rose-700 font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Aperçu 👁️
            </button>
          </div>
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 text-amber-700">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
              <span>Modèle d'alerte • Retard constaté</span>
            </label>
            <button
              type="button"
              onClick={() => setPreviewType("RETARD")}
              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                previewType === "RETARD" ? "bg-amber-50 text-amber-700 font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Aperçu 👁️
            </button>
          </div>
          <textarea
            rows={2}
            value={retardTemplate}
            onChange={(e) => setRetardTemplate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition leading-relaxed"
            required
          />
        </div>

        {/* Live preview box */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px]">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              Aperçu en direct du SMS / WhatsApp parent ({previewType}) :
            </span>
            <Badge variant="success">WhatsApp</Badge>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-emerald-200 text-slate-700 text-xs italic whitespace-pre-wrap leading-relaxed shadow-2xs font-sans">
            {currentPreviewText}
          </div>
        </div>
      </form>
    </Modal>
  );
};
