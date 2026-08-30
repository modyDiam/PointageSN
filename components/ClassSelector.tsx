"use client";

import React from "react";
import { GraduationCap, Users } from "lucide-react";
import { Student, AttendanceRecord } from "@/types";

interface ClassSelectorProps {
  classes: readonly string[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  students: Student[];
  attendance: AttendanceRecord;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  selectedClass,
  onSelectClass,
  students,
  attendance,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-600">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Niveau & Classe active
            </span>
            <span className="text-[11px] text-slate-400">
              Sélectionnez une classe pour gérer le pointage
            </span>
          </div>
        </div>

        {/* Segmented Control Buttons */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {classes.map((cls) => {
            const isSelected = selectedClass === cls;
            const classStudents = students.filter((s) => s.classLevel === cls);
            const totalStudents = classStudents.length;
            const absentCount = classStudents.filter(
              (s) => (attendance[s.id] || "PRESENT") === "ABSENT"
            ).length;
            const retardCount = classStudents.filter(
              (s) => (attendance[s.id] || "PRESENT") === "RETARD"
            ).length;

            return (
              <button
                key={cls}
                type="button"
                onClick={() => onSelectClass(cls)}
                className={`relative flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-150 font-semibold text-xs sm:text-sm ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 ring-1 ring-slate-900/5 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>{cls}</span>

                <div className="flex items-center gap-1">
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
                      isSelected
                        ? "bg-slate-100 text-slate-700"
                        : "bg-slate-200/70 text-slate-500"
                    }`}
                  >
                    {totalStudents}
                  </span>

                  {(absentCount > 0 || retardCount > 0) && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
