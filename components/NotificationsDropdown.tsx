"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  UserX,
  Clock,
  ClipboardCheck,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { Student, AttendanceRecord, AttendanceSession } from "@/types";
import { generateParentWhatsAppLink, formatPhoneDisplay } from "@/utils/whatsapp";

interface NotificationsDropdownProps {
  students: Student[];
  attendance: AttendanceRecord;
  historySessions: AttendanceSession[];
  schoolName: string;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  students,
  attendance,
  historySessions,
  schoolName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Build notifications items
  const notifications = React.useMemo(() => {
    const items = [];

    // Current absent students
    const absents = students.filter(
      (s) => (attendance[s.id] || "PRESENT") === "ABSENT"
    );
    absents.forEach((s) => {
      const id = `notif-abs-${s.id}`;
      if (!dismissedIds.has(id)) {
        items.push({
          id,
          type: "ABSENT",
          title: `Absence non justifiée • ${s.firstName} ${s.lastName}`,
          desc: `Classe ${s.classLevel} - Tuteur : ${s.parentName} (${formatPhoneDisplay(s.parentPhone)})`,
          whatsappUrl: generateParentWhatsAppLink(s, "ABSENT", schoolName),
          time: "Séance en cours",
          icon: UserX,
          iconColor: "text-rose-600 bg-rose-50 border-rose-200",
        });
      }
    });

    // Current late students
    const retards = students.filter(
      (s) => (attendance[s.id] || "PRESENT") === "RETARD"
    );
    retards.forEach((s) => {
      const id = `notif-ret-${s.id}`;
      if (!dismissedIds.has(id)) {
        items.push({
          id,
          type: "RETARD",
          title: `Retard signalé • ${s.firstName} ${s.lastName}`,
          desc: `Classe ${s.classLevel} - Arrivée tardive constatée`,
          whatsappUrl: generateParentWhatsAppLink(s, "RETARD", schoolName),
          time: "Séance en cours",
          icon: Clock,
          iconColor: "text-amber-600 bg-amber-50 border-amber-200",
        });
      }
    });

    // Recent session
    if (historySessions.length > 0) {
      const latest = historySessions[0];
      const id = `notif-sess-${latest.id}`;
      if (!dismissedIds.has(id)) {
        items.push({
          id,
          type: "SESSION",
          title: `Appel clôturé • ${latest.classLevel}`,
          desc: `Séance archivée le ${latest.date} (${latest.slot})`,
          whatsappUrl: null,
          time: "Récemment",
          icon: ClipboardCheck,
          iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
        });
      }
    }

    return items;
  }, [students, attendance, historySessions, schoolName, dismissedIds]);

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition shadow-2xs active:scale-95"
        title="Notifications et alertes de présence"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-2xs animate-pulse-subtle">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-modal z-50 overflow-hidden animate-scale-up">
          
          {/* Header */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">
                Centre de Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  {unreadCount} active{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  const allIds = new Set(notifications.map((n) => n.id));
                  setDismissedIds(allIds);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className="p-3 hover:bg-slate-50/80 transition-colors flex items-start gap-2.5"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${n.iconColor}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {n.desc}
                      </p>

                      {n.whatsappUrl && (
                        <div className="mt-1.5">
                          <a
                            href={n.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-bold rounded-md transition shadow-2xs"
                          >
                            <MessageSquare className="w-3 h-3 fill-current" />
                            <span>Notifier WhatsApp ↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Aucune notification active. Toutes les présences sont à jour !
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              PointageSN • Surveillance en direct
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
