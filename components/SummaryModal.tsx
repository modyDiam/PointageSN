"use client";

import React, { useState } from "react";
import {
  X,
  Copy,
  CheckCheck,
  Send,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl shadow-elevation overflow-hidden animate-scale-up my-8">
        
        {/* Header Modal */}
        <div className="bg-slate-50/80 border-b border-slate-200/80 p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Rapport de Synthèse de Séance
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 text-xs font-bold">
                  {selectedClass}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{schoolName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Fermer la modale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Info Date */}
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100/70 p-3 rounded-xl border border-slate-200/60">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Séance clôturée le : <strong className="text-slate-900">{sessionDateFormatted}</strong></span>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Effectif</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{total}</div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-emerald-700 uppercase">Présents</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{presents.length}</div>
            </div>

            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-rose-700 uppercase">Absents</div>
              <div className="text-xl font-black text-rose-700 mt-0.5">{absents.length}</div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-amber-700 uppercase">Retards</div>
              <div className="text-xl font-black text-amber-700 mt-0.5">{retards.length}</div>
            </div>
          </div>

          {/* Absents Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserX className="w-4 h-4 text-rose-600" />
              <span>Élèves Absents ({absents.length})</span>
            </h3>

            {absents.length > 0 ? (
              <div className="space-y-1.5">
                {absents.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-rose-50/40 border border-rose-100 text-xs gap-1"
                  >
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{s.firstName} {s.lastName}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] pl-7 sm:pl-0">
                      Tuteur : <strong className="text-slate-700">{s.parentName}</strong> ({formatPhoneDisplay(s.parentPhone)})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Aucune absence constatée pour cette classe.</span>
              </div>
            )}
          </div>

          {/* Retards Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-4 h-4 text-amber-600" />
              <span>Élèves en Retard ({retards.length})</span>
            </h3>

            {retards.length > 0 ? (
              <div className="space-y-1.5">
                {retards.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-amber-50/40 border border-amber-100 text-xs gap-1"
                  >
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{s.firstName} {s.lastName}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] pl-7 sm:pl-0">
                      Tuteur : <strong className="text-slate-700">{s.parentName}</strong> ({formatPhoneDisplay(s.parentPhone)})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Aucun retard constaté pour cette séance.</span>
              </div>
            )}
          </div>

          {/* Raw Generated Report Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Aperçu du message WhatsApp pour la Direction :
              </span>
              <span className="text-[11px] text-brand-600 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> Prêt à être transféré
              </span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto select-all">
              {reportText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50/80 border-t border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition"
          >
            Fermer
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Transfer to WhatsApp */}
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Transférer sur WhatsApp</span>
            </button>

            {/* Copy report */}
            <button
              type="button"
              onClick={handleCopyReport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
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
