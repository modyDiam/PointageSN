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
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 sm:p-3 backdrop-blur-md shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-2">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-300">
            Sélectionner la classe :
          </span>
        </div>

        {/* Mobile Dropdown & Tablet/Desktop Segmented Control */}
        <div className="grid grid-cols-3 gap-2">
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
                className={`relative flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all duration-200 font-medium text-sm border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-400/50 shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-500/30 scale-[1.02]"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold tracking-wide">
                  <span>{cls}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span
                    className={`flex items-center gap-0.5 ${
                      isSelected ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    {totalStudents}
                  </span>

                  {(absentCount > 0 || retardCount > 0) && (
                    <div className="flex items-center gap-1">
                      {absentCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/90 text-white text-[10px] font-bold">
                          {absentCount} abs
                        </span>
                      )}
                      {retardCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/90 text-white text-[10px] font-bold">
                          {retardCount} ret
                        </span>
                      )}
                    </div>
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
