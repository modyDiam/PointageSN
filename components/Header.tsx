"use client";

import React, { useState, useEffect } from "react";
import { Radio, Calendar, School, Clock, Sparkles } from "lucide-react";

interface HeaderProps {
  schoolName: string;
  onSchoolNameChange?: (newName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolName,
  onSchoolNameChange,
}) => {
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("");
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState<string>("");
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [tempSchoolName, setTempSchoolName] = useState(schoolName);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      // Capitalize first letter (ex: "Dimanche 30 août 2026")
      setCurrentDateFormatted(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
      
      const timeStr = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCurrentTimeFormatted(timeStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
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
    <header className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 shadow-2xl transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3.5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          {/* Titre & Slogan & Badge Live */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/20 text-white font-black text-xl shrink-0 border border-emerald-400/30">
              <span>🇸🇳</span>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping"></div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Pointage<span className="text-emerald-400">SN</span>
                </h1>

                {/* Badge Pointage Live avec pulsation verte */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Pointage Live</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400/80" />
                La Vie Scolaire Digitale & Instantanée
              </p>
            </div>
          </div>

          {/* Établissement & Date du jour */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* École */}
            <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-1.5 text-slate-300 flex items-center gap-2 transition shadow-inner">
              <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {isEditingSchool ? (
                <form onSubmit={handleSaveSchoolName} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempSchoolName}
                    onChange={(e) => setTempSchoolName(e.target.value)}
                    className="bg-slate-900 text-white text-xs px-2 py-0.5 rounded border border-slate-600 focus:outline-none focus:border-emerald-500 max-w-[160px]"
                    autoFocus
                  />
                  <button type="submit" className="text-emerald-400 hover:text-emerald-300 font-semibold px-1">
                    OK
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingSchool(true)}
                  className="font-medium text-slate-200 hover:text-emerald-300 transition truncate max-w-[200px] text-left"
                  title="Cliquer pour modifier le nom de l'école"
                >
                  {schoolName}
                </button>
              )}
            </div>

            {/* Date du jour en français */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-slate-300 flex items-center gap-2 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="font-semibold text-slate-200">
                {currentDateFormatted || "Aujourd'hui"}
              </span>
              {currentTimeFormatted && (
                <span className="text-slate-400 border-l border-slate-700 pl-2 font-mono text-[11px] hidden sm:inline">
                  {currentTimeFormatted}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
