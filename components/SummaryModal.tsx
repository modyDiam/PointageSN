"use client";

import React, { useState } from "react";
import { Student, AttendanceRecord } from "@/types";
import {
  X,
  Copy,
  Check,
  Share2,
  Users,
  UserX,
  Clock,
  CheckCircle2,
  MessageSquare,
  Building,
  Calendar,
} from "lucide-react";
import {
  generateDirectionReport,
  generateParentWhatsAppLink,
  formatPhoneDisplay,
} from "@/utils/whatsapp";

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
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullReportText = generateDirectionReport(
    selectedClass,
    students,
    attendance,
    schoolName,
    dateFormatted
  );

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(fullReportText);
      setCopied(true);
      onShowToast("Rapport officiel copié dans le presse-papiers ! 📋", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      onShowToast("Erreur lors de la copie du rapport", "warning");
    }
  };

  const whatsappDirectShareUrl = `https://wa.me/?text=${encodeURIComponent(fullReportText)}`;

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
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Fiche de Séance • {selectedClass}
              </h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.2">
                <span>{schoolName}</span>
                <span>•</span>
                <span>{dateFormatted}</span>
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
          
          {/* 4 Stats Chips */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
              <div className="text-base font-black text-slate-900 tabular-nums">{total}</div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-2 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Présents</div>
              <div className="text-base font-black text-emerald-800 tabular-nums">
                {presents.length} <span className="text-[10px] font-medium">({attendanceRate}%)</span>
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200/70 rounded-xl p-2 text-center">
              <div className="text-[10px] uppercase font-bold text-rose-700">Absents</div>
              <div className="text-base font-black text-rose-800 tabular-nums">{absents.length}</div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-2 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-700">Retards</div>
              <div className="text-base font-black text-amber-800 tabular-nums">{retards.length}</div>
            </div>
          </div>

          {/* Absents Details */}
          {absents.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>Élèves Absents ({absents.length}) :</span>
              </h4>
              <div className="bg-rose-50/40 border border-rose-200/60 rounded-xl divide-y divide-rose-100 overflow-hidden text-xs">
                {absents.map((s) => {
                  const url = generateParentWhatsAppLink(s, "ABSENT", schoolName);
                  return (
                    <div key={s.id} className="p-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900">{s.firstName} {s.lastName}</span>
                        <span className="text-slate-500 text-[11px] ml-1.5">
                          (Tuteur : {s.parentName} - {formatPhoneDisplay(s.parentPhone)})
                        </span>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-semibold rounded transition shrink-0 flex items-center gap-1 shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        <span>Alerter</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Retards Details */}
          {retards.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Arrivées Tardives ({retards.length}) :</span>
              </h4>
              <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl divide-y divide-amber-100 overflow-hidden text-xs">
                {retards.map((s) => {
                  const url = generateParentWhatsAppLink(s, "RETARD", schoolName);
                  return (
                    <div key={s.id} className="p-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900">{s.firstName} {s.lastName}</span>
                        <span className="text-slate-500 text-[11px] ml-1.5">
                          (Tuteur : {s.parentName} - {formatPhoneDisplay(s.parentPhone)})
                        </span>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-semibold rounded transition shrink-0 flex items-center gap-1 shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        <span>Alerter</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formatted Text Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Texte formaté pour le rapport de Direction :
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {fullReportText}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50/90 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between gap-2 flex-wrap">
          <a
            href={whatsappDirectShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Transférer sur WhatsApp</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-4 py-1.5 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white rounded-lg transition shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Rapport copié !" : "Copier le rapport"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
