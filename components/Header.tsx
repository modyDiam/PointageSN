"use client";

import React, { useState, useEffect } from "react";
import { Calendar, School, Clock, ChevronDown, Check, Sparkles } from "lucide-react";

interface HeaderProps {
  schoolName: string;
  onSchoolNameChange?: (newName: string) => void;
}

export const TIME_SLOTS = [
  "Matinée • 08h00 - 12h00",
  "Après-midi • 14h00 - 18h00",
  "Séance Continue • 08h00 - 14h00",
  "Cours du Soir • 18h00 - 20h00",
] as const;

export const Header: React.FC<HeaderProps> = ({
  schoolName,
  onSchoolNameChange,
}) => {
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [isSlotDropdownOpen, setIsSlotDropdownOpen] = useState<boolean>(false);
  const [isEditingSchool, setIsEditingSchool] = useState<boolean>(false);
  const [tempSchoolName, setTempSchoolName] = useState<string>(schoolName);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setCurrentDateFormatted(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSchoolName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSchoolName.trim() && onSchoolNameChange) {
      onSchoolNameChange(tempSchoolName.trim());
    }
    setIsEditingSchool(false);
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Logo, Titre & Tag "En direct" */}
          <div className="flex items-center gap-3">
            {/* SaaS Icon Badge */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-lg shadow-sm shadow-brand-500/20 shrink-0">
              <span>🇸🇳</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                  Pointage<span className="text-brand-600">SN</span>
                </h1>

                {/* Tag vert "En direct" */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>En direct</span>
                </div>
              </div>

              {/* Établissement & Créneau */}
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isEditingSchool ? (
                    <form onSubmit={handleSaveSchoolName} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tempSchoolName}
                        onChange={(e) => setTempSchoolName(e.target.value)}
                        className="bg-white text-slate-900 text-xs px-2 py-0.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 max-w-[180px]"
                        autoFocus
                      />
                      <button type="submit" className="text-brand-600 hover:text-brand-700 font-bold px-1">
                        OK
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsEditingSchool(true)}
                      className="font-medium text-slate-700 hover:text-brand-600 transition truncate max-w-[220px] text-left"
                      title="Cliquer pour modifier le nom de l'établissement"
                    >
                      {schoolName}
                    </button>
                  )}
                </div>

                <span className="text-slate-300">•</span>

                {/* Sélecteur de créneau */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSlotDropdownOpen(!isSlotDropdownOpen)}
                    className="flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100 px-2 py-0.5 rounded-md transition"
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{selectedSlot}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isSlotDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-scale-up">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setIsSlotDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition ${
                            selectedSlot === slot
                              ? "bg-brand-50 text-brand-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{slot}</span>
                          {selectedSlot === slot && <Check className="w-3.5 h-3.5 text-brand-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Date du jour */}
          <div className="flex items-center gap-2 text-xs">
            <div className="bg-slate-100/90 border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-700 font-medium flex items-center gap-2 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentDateFormatted || "Aujourd'hui"}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
