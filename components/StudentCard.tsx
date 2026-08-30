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
  CheckCheck,
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

  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

  return (
    <div
      className={`bg-white border rounded-2xl p-4 sm:p-4.5 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between gap-3.5 ${
        status === "ABSENT"
          ? "border-rose-200/90 ring-1 ring-rose-500/15"
          : status === "RETARD"
          ? "border-amber-200/90 ring-1 ring-amber-500/15"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      {/* Student Profile & Parent Details */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Circular Tinted Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
              status === "ABSENT"
                ? "bg-rose-100 text-rose-700 border border-rose-200"
                : status === "RETARD"
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-slate-100 text-slate-700 border border-slate-200/80"
            }`}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-slate-900 truncate tracking-tight">
                {fullName}
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                {student.classLevel}
              </span>
            </div>

            {/* Parent Info */}
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="text-slate-600 font-medium truncate max-w-[140px]">
                {student.parentName}
              </span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
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
          </div>
        </div>

        {/* Small Status indicator pill */}
        <div className="shrink-0">
          {status === "PRESENT" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3 h-3" /> Présent
            </span>
          )}
          {status === "ABSENT" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse-subtle">
              <X className="w-3 h-3" /> Absent
            </span>
          )}
          {status === "RETARD" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3 h-3" /> Retard
            </span>
          )}
        </div>
      </div>

      {/* 3-Segment iOS / SaaS Segmented Controller */}
      <div className="bg-slate-100/90 p-1 rounded-xl grid grid-cols-3 gap-1 border border-slate-200/60">
        {/* Présent */}
        <button
          type="button"
          onClick={() => {
            onStatusChange(student.id, "PRESENT");
            setAlertSent(false);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold text-xs transition-all duration-150 active:scale-95 ${
            status === "PRESENT"
              ? "bg-emerald-600 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Présent</span>
        </button>

        {/* Retard */}
        <button
          type="button"
          onClick={() => onStatusChange(student.id, "RETARD")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold text-xs transition-all duration-150 active:scale-95 ${
            status === "RETARD"
              ? "bg-amber-500 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Retard</span>
        </button>

        {/* Absent */}
        <button
          type="button"
          onClick={() => onStatusChange(student.id, "ABSENT")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold text-xs transition-all duration-150 active:scale-95 ${
            status === "ABSENT"
              ? "bg-rose-600 text-white shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>Absent</span>
        </button>
      </div>

      {/* WhatsApp Contextual Alert Action */}
      {(status === "ABSENT" || status === "RETARD") && (
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 animate-fade-in">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs sm:text-sm text-white transition-all shadow-xs active:scale-98 ${
              alertSent
                ? "bg-[#1f9d55] hover:bg-[#1b884a]"
                : "bg-[#25D366] hover:bg-[#20bd5a]"
            }`}
          >
            <MessageSquare className="w-4 h-4 fill-current shrink-0" />
            <span>
              {alertSent
                ? "Alerte envoyée (Renvoyer via WhatsApp)"
                : `Alerter le parent sur WhatsApp (${status === "ABSENT" ? "Absence" : "Retard"})`}
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0 ml-auto" />
          </a>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="italic truncate max-w-[240px]">
              {status === "ABSENT"
                ? "Motif : Signalement d'absence sans justification"
                : "Motif : Notification d'arrivée tardive"}
            </span>
            {alertSent && (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" /> Notifié
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
