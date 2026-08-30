"use client";

import React, { useState } from "react";
import {
  User,
  Phone,
  MessageSquare,
  Check,
  X,
  Clock,
  ExternalLink,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Student, AttendanceStatus } from "@/types";
import { generateParentWhatsAppLink, formatPhoneDisplay } from "@/utils/whatsapp";

interface StudentCardProps {
  student: Student;
  status: AttendanceStatus;
  onStatusChange: (studentId: string, newStatus: AttendanceStatus) => void;
  schoolName: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  status,
  onStatusChange,
  schoolName,
}) => {
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const fullName = `${student.firstName} ${student.lastName}`;
  const whatsappUrl = generateParentWhatsAppLink(student, status, schoolName);

  const handleWhatsAppClick = () => {
    setAlertSent(true);
  };

  // Dynamic borders and glows according to attendance status
  const cardBorderStyles = {
    PRESENT: "border-slate-800 hover:border-emerald-700/60 bg-slate-900/80 shadow-md",
    ABSENT: "border-rose-600/70 bg-rose-950/20 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30",
    RETARD: "border-amber-600/70 bg-amber-950/20 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30",
  };

  // Status badges
  const statusBadge = {
    PRESENT: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <Check className="w-3 h-3" /> Présent
      </span>
    ),
    ABSENT: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse-subtle">
        <X className="w-3 h-3" /> Absent
      </span>
    ),
    RETARD: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
        <Clock className="w-3 h-3" /> Retard
      </span>
    ),
  };

  // Avatar initials background
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 backdrop-blur-md flex flex-col justify-between gap-4 ${cardBorderStyles[status]}`}
    >
      {/* Student Details & Parent Contact */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Avatar with initials */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-inner ${
              status === "PRESENT"
                ? "bg-slate-800 text-slate-200 border-slate-700"
                : status === "ABSENT"
                ? "bg-rose-900/70 text-rose-200 border-rose-600/60"
                : "bg-amber-900/70 text-amber-200 border-amber-600/60"
            }`}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-white truncate tracking-tight">
                {fullName}
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                {student.classLevel}
              </span>
            </div>

            {/* Parent Info */}
            <div className="mt-1 space-y-0.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="text-slate-300 font-medium">{student.parentName}</span>
                <span className="text-slate-500 text-[11px]">(Tuteur)</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                <a
                  href={`tel:+${student.parentPhone}`}
                  className="hover:underline hover:text-emerald-300 transition"
                  title="Appeler le parent"
                >
                  {formatPhoneDisplay(student.parentPhone)}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Current status badge */}
        <div className="shrink-0">{statusBadge[status]}</div>
      </div>

      {/* 3 Tactile Buttons: [Présent (vert)], [Absent (rouge)], [Retard (orange)] */}
      <div className="grid grid-cols-3 gap-2">
        {/* Présent Button */}
        <button
          type="button"
          onClick={() => {
            onStatusChange(student.id, "PRESENT");
            setAlertSent(false);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 border ${
            status === "PRESENT"
              ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-700/40 ring-2 ring-emerald-500/30"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-800 hover:text-emerald-300"
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>Présent</span>
        </button>

        {/* Absent Button */}
        <button
          type="button"
          onClick={() => onStatusChange(student.id, "ABSENT")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 border ${
            status === "ABSENT"
              ? "bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-700/40 ring-2 ring-rose-500/30"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-rose-800 hover:text-rose-300"
          }`}
        >
          <X className="w-4 h-4 shrink-0" />
          <span>Absent</span>
        </button>

        {/* Retard Button */}
        <button
          type="button"
          onClick={() => onStatusChange(student.id, "RETARD")}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 border ${
            status === "RETARD"
              ? "bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-700/40 ring-2 ring-amber-500/30"
              : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-800 hover:text-amber-300"
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Retard</span>
        </button>
      </div>

      {/* WhatsApp Trigger Button when status is ABSENT or RETARD */}
      {(status === "ABSENT" || status === "RETARD") && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition-all duration-200 shadow-lg active:scale-98 ${
              alertSent
                ? "bg-emerald-700 hover:bg-emerald-600 border border-emerald-400/40 shadow-emerald-950/50"
                : "bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/60 shadow-emerald-600/30 ring-2 ring-emerald-400/20"
            }`}
          >
            <MessageSquare className="w-4 h-4 fill-current shrink-0" />
            <span>
              {alertSent ? "Alerte déjà ouverte (Re-notifier)" : "Alerter le parent sur WhatsApp"}
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0 ml-auto" />
          </a>

          {/* Alert status reminder */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="italic truncate">
              {status === "ABSENT"
                ? "Message : Signalement d'absence sans justification"
                : "Message : Signalement d'arrivée tardive"}
            </span>
            {alertSent && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" /> Envoyé
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
