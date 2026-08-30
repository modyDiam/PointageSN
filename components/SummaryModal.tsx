"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  CheckCheck,
  Send,
  Users,
  UserCheck,
  UserX,
  ClockAlert,
  FileSpreadsheet,
  Calendar,
  Building,
  Sparkles,
} from "lucide-react";
import { Student, AttendanceRecord } from "@/types";
import { generateDirectionReport, formatPhoneDisplay } from "@/utils/whatsapp";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
  students: Student[];
  attendance: AttendanceRecord;
  schoolName: string;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  students,
  attendance,
  schoolName,
  onShowToast,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const now = new Date();
  const sessionDateFormatted = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const classStudents = students.filter((s) => s.classLevel === selectedClass);
  const total = classStudents.length;
  const absents = classStudents.filter(
    (s) => (attendance[s.id] || "PRESENT") === "ABSENT"
  );
  const retards = classStudents.filter(
    (s) => (attendance[s.id] || "PRESENT") === "RETARD"
  );
  const presents = classStudents.filter(
    (s) => (attendance[s.id] || "PRESENT") === "PRESENT"
  );

  const attendanceRate =
    total > 0 ? Math.round(((presents.length + retards.length) / total) * 100) : 100;

  const reportText = generateDirectionReport(
    selectedClass,
    students,
    attendance,
    schoolName,
    sessionDateFormatted
  );

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      onShowToast("Rapport copié dans le presse-papiers avec succès ! 🎉", "success");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Clipboard copy error:", err);
      onShowToast("Erreur lors de la copie du rapport", "warning");
    }
  };

  const handleSendViaWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(waUrl, "_blank");
    onShowToast("Ouverture de WhatsApp pour l'envoi du rapport 📲", "info");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up my-8">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  Clôture & Rapport de Séance
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
                  {selectedClass}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>{schoolName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Info Bar */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Séance pointée le : <strong className="text-slate-200">{sessionDateFormatted}</strong></span>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Effectif</div>
              <div className="text-xl font-black text-white mt-1">{total}</div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase">Présents</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{presents.length}</div>
            </div>

            <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-rose-400 uppercase">Absents</div>
              <div className="text-xl font-black text-rose-400 mt-1">{absents.length}</div>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-amber-400 uppercase">Retards</div>
              <div className="text-xl font-black text-amber-400 mt-1">{retards.length}</div>
            </div>
          </div>

          {/* Absents List */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-400" />
              <span>Élèves Absents ({absents.length})</span>
            </h3>

            {absents.length > 0 ? (
              <div className="space-y-1.5">
                {absents.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs gap-1"
                  >
                    <div className="font-semibold text-rose-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-900/80 text-rose-300 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{s.firstName} {s.lastName}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] pl-7 sm:pl-0">
                      Parent : <strong className="text-slate-300">{s.parentName}</strong> ({formatPhoneDisplay(s.parentPhone)})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>Aucune absence constatée pour cette séance. Bravo !</span>
              </div>
            )}
          </div>

          {/* Retards List */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ClockAlert className="w-4 h-4 text-amber-400" />
              <span>Élèves en Retard ({retards.length})</span>
            </h3>

            {retards.length > 0 ? (
              <div className="space-y-1.5">
                {retards.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs gap-1"
                  >
                    <div className="font-semibold text-amber-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-900/80 text-amber-300 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{s.firstName} {s.lastName}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] pl-7 sm:pl-0">
                      Parent : <strong className="text-slate-300">{s.parentName}</strong> ({formatPhoneDisplay(s.parentPhone)})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>Aucun retard constaté pour cette séance.</span>
              </div>
            )}
          </div>

          {/* Raw Generated Report Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Aperçu du rapport texte (WhatsApp) :
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" /> Formaté & prêt à coller
              </span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto select-all">
              {reportText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition"
          >
            Fermer
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Direct WhatsApp to Direction / General WhatsApp */}
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-700/40 font-bold text-xs sm:text-sm transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Transférer sur WhatsApp</span>
            </button>

            {/* Copy Report for Direction */}
            <button
              type="button"
              onClick={handleCopyReport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-700/30 transition active:scale-95 ring-2 ring-emerald-400/30"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-white" />
                  <span>Rapport copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copier le rapport pour la Direction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
