"use client";

import React, { useState, useMemo } from "react";
import {
  Student,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
} from "@/types";
import {
  FileText,
  Printer,
  Download,
  Copy,
  Share2,
  Calendar,
  Building,
  CheckCircle2,
  UserX,
  Clock,
  Search,
  Filter,
  Check,
  Phone,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import {
  generateDirectionReport,
  generateParentWhatsAppLink,
  formatPhoneDisplay,
} from "@/utils/whatsapp";
import { exportMonthlyRegisterCSV } from "@/utils/csv";

interface ReportsManagementViewProps {
  students: Student[];
  availableClasses: string[];
  attendance: AttendanceRecord;
  historySessions: AttendanceSession[];
  schoolName: string;
  selectedSlot: string;
  currentDateFormatted: string;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const ReportsManagementView: React.FC<ReportsManagementViewProps> = ({
  students,
  availableClasses,
  attendance,
  historySessions,
  schoolName,
  selectedSlot,
  currentDateFormatted,
  onShowToast,
}) => {
  // Selected Session: "LIVE" (Current roll call in progress) or a specific session id from historySessions
  const [selectedSessionId, setSelectedSessionId] = useState<string>("LIVE");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ABSENT" | "RETARD" | "PRESENT">("ALL");
  const [copied, setCopied] = useState<boolean>(false);

  // Active Session Object
  const currentSessionData = useMemo(() => {
    if (selectedSessionId === "LIVE") {
      return {
        id: "LIVE",
        date: currentDateFormatted,
        slot: selectedSlot,
        classLevel: selectedClassFilter === "ALL" ? availableClasses[0] || "6e A" : selectedClassFilter,
        records: attendance,
        isLive: true,
      };
    }

    const found = historySessions.find((s) => s.id === selectedSessionId);
    if (found) {
      return {
        ...found,
        isLive: false,
      };
    }

    return {
      id: "LIVE",
      date: currentDateFormatted,
      slot: selectedSlot,
      classLevel: selectedClassFilter === "ALL" ? availableClasses[0] || "6e A" : selectedClassFilter,
      records: attendance,
      isLive: true,
    };
  }, [selectedSessionId, historySessions, currentDateFormatted, selectedSlot, selectedClassFilter, availableClasses, attendance]);

  // Students in selected report
  const sessionStudents = useMemo(() => {
    let list = students.filter((s) => s.classLevel === currentSessionData.classLevel);

    if (statusFilter !== "ALL") {
      list = list.filter((s) => {
        const st = currentSessionData.records[s.id] || "PRESENT";
        return st === statusFilter;
      });
    }

    return list;
  }, [students, currentSessionData, statusFilter]);

  // Session Statistics
  const sessionStats = useMemo(() => {
    const classAllStudents = students.filter((s) => s.classLevel === currentSessionData.classLevel);
    const total = classAllStudents.length;
    let present = 0;
    let absent = 0;
    let retard = 0;

    classAllStudents.forEach((s) => {
      const st = currentSessionData.records[s.id] || "PRESENT";
      if (st === "PRESENT") present++;
      else if (st === "ABSENT") absent++;
      else if (st === "RETARD") retard++;
    });

    const rate = total > 0 ? Math.round(((present + retard) / total) * 100) : 100;

    return { total, present, absent, retard, rate };
  }, [students, currentSessionData]);

  // Formatted report text for copying and WhatsApp sharing
  const formattedReportText = useMemo(() => {
    return generateDirectionReport(
      currentSessionData.classLevel,
      students,
      currentSessionData.records,
      schoolName,
      `${currentSessionData.date} (${currentSessionData.slot})`
    );
  }, [currentSessionData, students, schoolName]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedReportText);
      setCopied(true);
      onShowToast("Rapport administratif copié dans le presse-papiers ! 📋", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      onShowToast("Erreur lors de la copie du rapport", "warning");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate CSV for current session
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel
    csvContent += "Classe;Numero;Prenom;Nom;Tuteur;Telephone;Statut Presence;Date;Creneau\n";

    sessionStudents.forEach((s, idx) => {
      const st = currentSessionData.records[s.id] || "PRESENT";
      csvContent += `"${s.classLevel}";${idx + 1};"${s.firstName}";"${s.lastName}";"${s.parentName}";"${s.parentPhone}";"${st}";"${currentSessionData.date}";"${currentSessionData.slot}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport_pointage_${currentSessionData.classLevel}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Rapport exporté au format CSV / Excel 📥", "success");
  };

  const whatsappDirectShareUrl = `https://wa.me/?text=${encodeURIComponent(formattedReportText)}`;

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      
      {/* 1. TOP HEADER & CONTROLS (Hidden on Print) */}
      <div className="no-print bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                Centre des Rapports Administratifs & Export PDF
              </h1>
              <p className="text-[11px] text-slate-500">
                Génération, prévisualisation et archivage officiel des fiches de présence
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Print / PDF button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
            title="Imprimer ou enregistrer en PDF au format officiel A4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>

          {/* Export Excel button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-semibold text-xs rounded-xl shadow-2xs transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-brand-600" />
            <span>Export Excel</span>
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-semibold text-xs rounded-xl shadow-2xs transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? "Copié !" : "Copier"}</span>
          </button>

          {/* WhatsApp share button */}
          <a
            href={whatsappDirectShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-2xs transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. FILTERS BAR (Hidden on Print) */}
      <div className="no-print bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 max-w-full">
          {availableClasses.map((cls) => {
            const isSelected = currentSessionData.classLevel === cls;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClassFilter(cls)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Classe {cls}
              </button>
            );
          })}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filtrer statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Tous les élèves ({students.filter(s => s.classLevel === currentSessionData.classLevel).length})</option>
            <option value="ABSENT">Absents uniquement ({sessionStats.absent})</option>
            <option value="RETARD">Retards uniquement ({sessionStats.retard})</option>
            <option value="PRESENT">Présents uniquement ({sessionStats.present})</option>
          </select>
        </div>
      </div>

      {/* 3. DUAL COLUMN: SESSIONS LIST (LEFT) + PRINTABLE A4 REPORT (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Sessions History Switcher (Hidden on Print) */}
        <div className="no-print lg:col-span-4 space-y-2.5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Séances & Historique</span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                {historySessions.length + 1} séance(s)
              </span>
            </h3>

            {/* Live active session option */}
            <button
              type="button"
              onClick={() => setSelectedSessionId("LIVE")}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                selectedSessionId === "LIVE"
                  ? "bg-slate-100/90 border-navy-900 shadow-2xs font-bold"
                  : "bg-slate-50/70 hover:bg-slate-100 border-slate-200/80"
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle"></span>
                  <span className="font-extrabold">Séance en cours (En direct)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {currentDateFormatted} • {selectedSlot}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Archived sessions */}
            {historySessions.length > 0 ? (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                {historySessions.map((sess) => {
                  const isSelected = selectedSessionId === sess.id;
                  return (
                    <button
                      key={sess.id}
                      type="button"
                      onClick={() => {
                        setSelectedSessionId(sess.id);
                        setSelectedClassFilter(sess.classLevel);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between mt-1.5 ${
                        isSelected
                          ? "bg-slate-100/90 border-navy-900 shadow-2xs font-bold"
                          : "bg-white hover:bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          Classe {sess.classLevel}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {sess.date} ({sess.slot})
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic pt-1">
                Aucune séance archivée antérieure. Clôturez un pointage pour enrichir l'historique.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: OFFICIAL PRINTABLE A4 ADMINISTRATIVE SHEET */}
        <div className="lg:col-span-8">
          <div
            id="printable-report"
            className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 text-slate-900 font-sans"
          >
            
            {/* 1. OFFICIAL ADMINISTRATIVE HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    RÉPUBLIQUE DU SÉNÉGAL
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Ministère de l'Éducation Nationale
                  </div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {schoolName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 font-extrabold text-sm text-slate-900 tracking-tight">
                    <span>Pointage</span><span className="text-brand-600">SN</span>
                  </div>
                  <div className="text-[9px] uppercase font-semibold tracking-wider text-slate-400">
                    Gestion Scolaire Officielle
                  </div>
                </div>
              </div>

              {/* Document Title Banner */}
              <div className="pt-2 text-center">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900 bg-slate-100 py-1.5 px-3 rounded-lg border border-slate-200">
                  Fiche Administrative de Pointage de Séance
                </h2>
              </div>

              {/* Metadata 4-Box Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Classe / Division :</span>
                  <strong className="text-slate-900 text-xs">{currentSessionData.classLevel}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date de la séance :</span>
                  <strong className="text-slate-900 text-xs">{currentSessionData.date}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Créneau Horaire :</span>
                  <strong className="text-slate-900 text-xs">{currentSessionData.slot}</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Statut Document :</span>
                  <strong className="text-emerald-700 text-xs">
                    {currentSessionData.isLive ? "En direct (Provisoire)" : "Archivé (Certifié)"}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. STATISTICAL SYNTHESIS BOX */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Bilan & Synthèse d'Assiduité
              </h3>
              
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="border border-slate-200 p-2 rounded-lg bg-slate-50/80">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Effectif Inscrit</div>
                  <div className="text-base font-black text-slate-900 tabular-nums">{sessionStats.total}</div>
                </div>

                <div className="border border-emerald-200 p-2 rounded-lg bg-emerald-50/40 text-emerald-900">
                  <div className="text-[10px] font-bold uppercase">Présents</div>
                  <div className="text-base font-black tabular-nums">
                    {sessionStats.present} <span className="text-[10px] font-medium">({sessionStats.rate}%)</span>
                  </div>
                </div>

                <div className="border border-rose-200 p-2 rounded-lg bg-rose-50/40 text-rose-900">
                  <div className="text-[10px] font-bold uppercase">Absents</div>
                  <div className="text-base font-black tabular-nums">{sessionStats.absent}</div>
                </div>

                <div className="border border-amber-200 p-2 rounded-lg bg-amber-50/40 text-amber-900">
                  <div className="text-[10px] font-bold uppercase">Retards</div>
                  <div className="text-base font-black tabular-nums">{sessionStats.retard}</div>
                </div>
              </div>
            </div>

            {/* 3. DETAILED NOMINAL LIST OF STUDENTS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Registre Nominatif des Élèves ({sessionStudents.length})
                </h3>
                {statusFilter !== "ALL" && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    Filtre actif : {statusFilter}
                  </span>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                      <th className="py-2 px-2.5 w-8 text-center border-r border-slate-200">#</th>
                      <th className="py-2 px-3 border-r border-slate-200">Élève (Nom & Prénom)</th>
                      <th className="py-2 px-3 border-r border-slate-200">Tuteur Légal</th>
                      <th className="py-2 px-3 border-r border-slate-200">Contact Téléphone</th>
                      <th className="py-2 px-3 text-center border-r border-slate-200">Statut</th>
                      <th className="py-2 px-3 text-right">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessionStudents.map((s, idx) => {
                      const st = currentSessionData.records[s.id] || "PRESENT";

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="py-2 px-2.5 text-center font-mono text-[11px] text-slate-400 border-r border-slate-100">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-100">
                            {s.firstName} {s.lastName}
                          </td>
                          <td className="py-2 px-3 text-slate-700 border-r border-slate-100">
                            {s.parentName}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600 border-r border-slate-100">
                            {formatPhoneDisplay(s.parentPhone)}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-100">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                st === "ABSENT"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : st === "RETARD"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {st === "ABSENT" ? "Absent" : st === "RETARD" ? "Retard" : "Présent"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-[11px] text-slate-400 italic">
                            {st === "ABSENT" ? "Non justifié" : st === "RETARD" ? "Arrivée tardive" : "En classe"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. OFFICIAL SIGNATURE & VISA AREA */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div className="space-y-12">
                <div>
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                    Le Professeur / Surveillant Général :
                  </div>
                  <p className="text-[10px] text-slate-400">Date et émargement de séance</p>
                </div>
                <div className="border-b border-dashed border-slate-300 w-48"></div>
              </div>

              <div className="text-right space-y-12">
                <div>
                  <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                    Visa & Cachet de la Direction :
                  </div>
                  <p className="text-[10px] text-slate-400">{schoolName}</p>
                </div>
                <div className="border-b border-dashed border-slate-300 w-48 ml-auto"></div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
              Document généré via PointageSN 🇸🇳 • Gestion Scolaire & Alertes Parentales Instantanées
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
