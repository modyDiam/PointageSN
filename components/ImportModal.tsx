"use client";

import React, { useState, useRef } from "react";
import {
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
import { Modal, Button, Badge, Alert } from "@/components/ui";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importer des Élèves (CSV / Excel)"
      description="Injectez rapidement vos listes de classes avec contacts parentaux"
      icon={<FileSpreadsheet className="w-4 h-4 text-brand-400" />}
      maxWidth="lg"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onRestoreDefaults();
              onShowToast("Données de démo rétablies !", "info");
              onClose();
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Rétablir Démo
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyImport}
              disabled={previewStudents.length === 0}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Importer ({previewStudents.length} élèves)
            </Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {/* Template download & format reminder */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800">Format requis :</span>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Prenom, Nom, Classe, Parent, Telephone
            </p>
          </div>

          <Button
            variant="secondary"
            size="xs"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="w-3 h-3 text-brand-600" />}
          >
            Télécharger Modèle CSV
          </Button>
        </div>

        {/* Drag & drop upload area */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, .txt, .tsv"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-brand-500 hover:bg-brand-50/20 rounded-2xl p-5 text-center cursor-pointer transition-colors space-y-1.5"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
              <UploadCloud className="w-5 h-5 text-brand-600" />
            </div>
            <div className="text-xs font-bold text-slate-800">
              Glissez votre fichier ici ou cliquez pour parcourir
            </div>
            <p className="text-[10px] text-slate-400">
              Prend en charge les fichiers .CSV et texte exportés depuis Excel
            </p>
          </div>
        </div>

        {/* Direct text pasting */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Ou collez directement votre texte brut CSV :</span>
          </label>
          <textarea
            rows={3}
            value={csvText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Moussa,Diop,6e A,Mamadou Diop,221777501565&#10;Fatou,Ndiaye,6e A,Awa Ndiaye,221771234567"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
          />
        </div>

        {/* Errors list */}
        {parseErrors.length > 0 && (
          <Alert variant="danger" title="Avertissements de formatage :">
            <ul className="list-disc pl-4 space-y-0.5">
              {parseErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Detection preview badge summary */}
        {previewStudents.length > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-emerald-800 font-bold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{previewStudents.length} élèves détectés avec succès</span>
              </span>
              <Badge variant="success">{detectedClasses.length} classe(s)</Badge>
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {detectedClasses.map((cls) => {
                const count = previewStudents.filter((s) => s.classLevel === cls).length;
                return (
                  <Badge key={cls} variant="neutral">
                    {cls} ({count} élèves)
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
