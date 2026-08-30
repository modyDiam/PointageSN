"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Student } from "@/types";
import { parseStudentsCSV, SAMPLE_CSV_TEMPLATE } from "@/utils/csv";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedStudents: Student[]) => void;
  onRestoreDefaults: () => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onRestoreDefaults,
  onShowToast,
}) => {
  const [csvText, setCsvText] = useState<string>("");
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const res = parseStudentsCSV(content);
      setPreviewStudents(res.students);
      setParseErrors(res.errors);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (!text.trim()) {
      setPreviewStudents([]);
      setParseErrors([]);
      return;
    }
    const res = parseStudentsCSV(text);
    setPreviewStudents(res.students);
    setParseErrors(res.errors);
  };

  const handleApplyImport = () => {
    if (previewStudents.length === 0) {
      onShowToast("Aucun élève valide détecté à importer.", "warning");
      return;
    }
    onImportSuccess(previewStudents);
    onShowToast(`${previewStudents.length} élèves importés avec succès ! 🚀`, "success");
    onClose();
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob(["\uFEFF" + SAMPLE_CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele_eleves_pointagesn.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Modèle CSV téléchargé !", "info");
  };

  const detectedClasses = Array.from(new Set(previewStudents.map((s) => s.classLevel)));

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
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Importation des Élèves & Classes
              </h2>
              <p className="text-[11px] text-slate-500">
                Fichier CSV ou Excel (Prénom, Nom, Classe, Parent, Téléphone)
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

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50/60 hover:bg-brand-50/20 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.txt,.tsv"
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-600 mx-auto mb-1.5 transition-colors" />
            <p className="text-xs font-semibold text-slate-700">
              Glissez votre fichier ici ou cliquez pour parcourir
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Formats supportés : .csv, .txt (séparateur virgule ou point-virgule)
            </p>
          </div>

          {/* Direct Paste Fallback */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Ou collez directement votre tableau :
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition"
              >
                <Download className="w-3 h-3" />
                <span>Télécharger modèle CSV</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Prénom;Nom;Classe;Parent;Telephone&#10;Moussa;Diop;6e A;Mamadou Diop;221777501565"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          {/* Parse Preview */}
          {previewStudents.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{previewStudents.length} élève(s) détecté(s)</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600">
                  Classes : {detectedClasses.join(", ")}
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto text-[11px] text-slate-600 divide-y divide-slate-100">
                {previewStudents.slice(0, 5).map((s, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span className="font-medium text-slate-800">
                      {s.firstName} {s.lastName} ({s.classLevel})
                    </span>
                    <span className="text-slate-500 font-mono">
                      {s.parentName} - {s.parentPhone}
                    </span>
                  </div>
                ))}
                {previewStudents.length > 5 && (
                  <div className="py-1 text-slate-400 italic">
                    + {previewStudents.length - 5} autre(s) élève(s)...
                  </div>
                )}
              </div>
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Avertissements :</span>
                <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                  {parseErrors.slice(0, 3).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50/90 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onRestoreDefaults();
              onShowToast("Données démo rétablies !", "info");
              onClose();
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2 py-1 rounded-lg transition"
            title="Revenir aux 12 élèves de démo sénégalais"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rétablir démo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleApplyImport}
              disabled={previewStudents.length === 0}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                previewStudents.length > 0
                  ? "bg-navy-900 hover:bg-navy-800 text-white shadow-xs"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Importer ({previewStudents.length})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
