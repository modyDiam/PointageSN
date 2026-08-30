"use client";

import React, { useState } from "react";
import { Student, AttendanceStatus } from "@/types";
import {
  generateParentWhatsAppLink,
  formatPhoneDisplay,
} from "@/utils/whatsapp";
import {
  Check,
  X,
  Clock,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Phone,
  User,
} from "lucide-react";

interface StudentListTableProps {
  students: Student[];
  attendance: Record<string, AttendanceStatus>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  schoolName: string;
  absentTemplate?: string;
  retardTemplate?: string;
}

export const StudentListTable: React.FC<StudentListTableProps> = ({
  students,
  attendance,
  onStatusChange,
  schoolName,
  absentTemplate,
  retardTemplate,
}) => {
  const [alertedStudentIds, setAlertedStudentIds] = useState<Set<string>>(new Set());

  const handleWhatsAppClick = (studentId: string) => {
    setAlertedStudentIds((prev) => new Set(prev).add(studentId));
  };

  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 shadow-2xs">
        Aucun élève trouvé. Modifiez votre filtre ou importez une liste via le bouton <strong>Importer</strong>.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* Desktop & Tablet Table Header */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2 bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        <div className="sm:col-span-4">Élève & Classe</div>
        <div className="sm:col-span-3">Tuteur & Téléphone</div>
        <div className="sm:col-span-3">Statut de Présence</div>
        <div className="sm:col-span-2 text-right">Alerte WhatsApp</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {students.map((student) => {
          const status = attendance[student.id] || "PRESENT";
          const isAlerted = alertedStudentIds.has(student.id);
          const whatsappUrl = generateParentWhatsAppLink(
            student,
            status,
            schoolName,
            absentTemplate,
            retardTemplate
          );
          const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

          return (
            <div
              key={student.id}
              className={`p-3 sm:px-4 sm:py-2.5 transition-colors flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-3 ${
                status === "ABSENT"
                  ? "bg-rose-50/25 hover:bg-rose-50/40"
                  : status === "RETARD"
                  ? "bg-amber-50/25 hover:bg-amber-50/40"
                  : "hover:bg-slate-50/80"
              }`}
            >
              {/* Col 1 : Élève */}
              <div className="sm:col-span-4 flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    status === "ABSENT"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : status === "RETARD"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200/80"
                  }`}
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60 shrink-0">
                      {student.classLevel}
                    </span>
                  </div>

                  {/* Mobile-only tutor line */}
                  <div className="sm:hidden text-[11px] text-slate-500 mt-0.5 truncate">
                    {student.parentName} •{" "}
                    <a
                      href={`tel:+${student.parentPhone}`}
                      className="hover:underline text-slate-600 font-mono"
                    >
                      {formatPhoneDisplay(student.parentPhone)}
                    </a>
                  </div>
                </div>
              </div>

              {/* Col 2 : Tuteur & Contact (Desktop only) */}
              <div className="hidden sm:block sm:col-span-3 min-w-0 text-xs">
                <div className="text-slate-800 font-medium truncate">
                  {student.parentName}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <a
                    href={`tel:+${student.parentPhone}`}
                    className="hover:text-brand-600 transition hover:underline"
                    title="Appeler le parent"
                  >
                    {formatPhoneDisplay(student.parentPhone)}
                  </a>
                </div>
              </div>

              {/* Col 3 : Sélecteur segmenté 3 segments */}
              <div className="sm:col-span-3">
                <div className="bg-slate-100/90 p-0.5 rounded-lg grid grid-cols-3 gap-0.5 border border-slate-200/60">
                  {/* Présent */}
                  <button
                    type="button"
                    onClick={() => onStatusChange(student.id, "PRESENT")}
                    className={`py-1 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      status === "PRESENT"
                        ? "bg-emerald-600 text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Présent</span>
                  </button>

                  {/* Retard */}
                  <button
                    type="button"
                    onClick={() => onStatusChange(student.id, "RETARD")}
                    className={`py-1 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      status === "RETARD"
                        ? "bg-amber-500 text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Retard</span>
                  </button>

                  {/* Absent */}
                  <button
                    type="button"
                    onClick={() => onStatusChange(student.id, "ABSENT")}
                    className={`py-1 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      status === "ABSENT"
                        ? "bg-rose-600 text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <X className="w-3 h-3" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>

              {/* Col 4 : Bouton WhatsApp contextuel */}
              <div className="sm:col-span-2 flex items-center sm:justify-end">
                {status === "ABSENT" || status === "RETARD" ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleWhatsAppClick(student.id)}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-all shadow-2xs active:scale-95 whitespace-nowrap ${
                      isAlerted
                        ? "bg-emerald-700 hover:bg-emerald-800"
                        : "bg-[#25D366] hover:bg-[#20bd5a]"
                    }`}
                    title="Envoyer l'alerte pré-remplie par WhatsApp au parent"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>{isAlerted ? "Alerte envoyée ↗" : "Alerter parent ↗"}</span>
                  </a>
                ) : (
                  <span className="hidden sm:inline-block text-[11px] text-slate-300 italic">
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
