"use client";

import React, { useState } from "react";
import { Student, AttendanceRecord } from "@/types";
import {
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
import { Modal, Button, Badge } from "@/components/ui";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rapport de Séance • Classe ${selectedClass}`}
      description={`${schoolName} • ${dateFormatted}`}
      icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyReport}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copié !" : "Copier le rapport"}
            </Button>

            <a
              href={whatsappDirectShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Transférer Direction WhatsApp</span>
            </a>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {/* KPI Mini-cards */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
            <div className="text-lg font-black text-slate-900 tabular-nums">{total}</div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-emerald-800">Présents</div>
            <div className="text-lg font-black text-emerald-800 tabular-nums">{presents.length}</div>
          </div>
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-rose-800">Absents</div>
            <div className="text-lg font-black text-rose-800 tabular-nums">{absents.length}</div>
          </div>
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-2.5">
            <div className="text-[10px] uppercase font-bold text-amber-800">Retards</div>
            <div className="text-lg font-black text-amber-800 tabular-nums">{retards.length}</div>
          </div>
        </div>

        {/* Absents list */}
        {absents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-800">
              <span className="flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>Élèves absents à notifier ({absents.length})</span>
              </span>
              <Badge variant="danger">Action requise</Badge>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {absents.map((student) => (
                <div
                  key={student.id}
                  className="bg-rose-50/50 border border-rose-200/70 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Tuteur : {student.parentName} ({formatPhoneDisplay(student.parentPhone)})
                    </div>
                  </div>

                  <a
                    href={generateParentWhatsAppLink(student, "ABSENT", schoolName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold rounded-lg transition shrink-0 shadow-2xs"
                  >
                    <MessageSquare className="w-3 h-3 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official report preview */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Format de Transmission Direction :
          </div>
          <div className="bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl p-3 max-h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {fullReportText}
          </div>
        </div>
      </div>
    </Modal>
  );
};
