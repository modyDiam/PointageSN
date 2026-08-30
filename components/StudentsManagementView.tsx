"use client";

import React, { useState, useMemo } from "react";
import {
  Student,
  AttendanceRecord,
  AttendanceSession,
} from "@/types";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Pencil,
  Trash2,
  Phone,
  MessageSquare,
  Building,
  ShieldAlert,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { formatPhoneDisplay, generateParentWhatsAppLink } from "@/utils/whatsapp";
import { Button, Badge, Card, EmptyState, Modal } from "@/components/ui";

interface StudentsManagementViewProps {
  students: Student[];
  availableClasses: string[];
  attendance: AttendanceRecord;
  historySessions: AttendanceSession[];
  schoolName: string;
  onOpenAddStudent: () => void;
  onOpenEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onOpenImport: () => void;
  onRestoreDefaults: () => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const StudentsManagementView: React.FC<StudentsManagementViewProps> = ({
  students,
  availableClasses,
  attendance,
  historySessions,
  schoolName,
  onOpenAddStudent,
  onOpenEditStudent,
  onDeleteStudent,
  onOpenImport,
  onRestoreDefaults,
  onShowToast,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"NAME_ASC" | "NAME_DESC" | "CLASS" | "RATE">("NAME_ASC");
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Compute cumulative student monthly statistics
  const studentStats = useMemo(() => {
    const statsMap: Record<
      string,
      { absent: number; retard: number; present: number; totalSessions: number; rate: number }
    > = {};

    students.forEach((s) => {
      statsMap[s.id] = { absent: 0, retard: 0, present: 0, totalSessions: 0, rate: 100 };
    });

    historySessions.forEach((session) => {
      Object.entries(session.records).forEach(([studentId, status]) => {
        if (!statsMap[studentId]) {
          statsMap[studentId] = { absent: 0, retard: 0, present: 0, totalSessions: 0, rate: 100 };
        }
        statsMap[studentId].totalSessions++;
        if (status === "ABSENT") statsMap[studentId].absent++;
        else if (status === "RETARD") statsMap[studentId].retard++;
        else if (status === "PRESENT") statsMap[studentId].present++;
      });
    });

    Object.keys(statsMap).forEach((id) => {
      const item = statsMap[id];
      if (item.totalSessions > 0) {
        item.rate = Math.round(((item.present + item.retard) / item.totalSessions) * 100);
      } else {
        item.rate = 100;
      }
    });

    return statsMap;
  }, [students, historySessions]);

  // Overall calculations
  const totalStudents = students.length;
  const criticalStudentsCount = useMemo(() => {
    return Object.values(studentStats).filter((st) => st.absent >= 3).length;
  }, [studentStats]);

  // Filter & Sort students
  const filteredAndSortedStudents = useMemo(() => {
    let list = students.filter((student) => {
      const matchesClass =
        selectedClassFilter === "ALL" || student.classLevel === selectedClassFilter;
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const parentName = student.parentName.toLowerCase();
      const phone = student.parentPhone.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        parentName.includes(query) ||
        phone.includes(query);

      return matchesClass && matchesSearch;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "NAME_ASC") {
        return a.lastName.localeCompare(b.lastName);
      } else if (sortBy === "NAME_DESC") {
        return b.lastName.localeCompare(a.lastName);
      } else if (sortBy === "CLASS") {
        return a.classLevel.localeCompare(b.classLevel);
      } else if (sortBy === "RATE") {
        const rateA = studentStats[a.id]?.rate ?? 100;
        const rateB = studentStats[b.id]?.rate ?? 100;
        return rateA - rateB; // lowest rate first
      }
      return 0;
    });

    return list;
  }, [students, selectedClassFilter, searchQuery, sortBy, studentStats]);

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      onShowToast(`Élève ${studentToDelete.firstName} ${studentToDelete.lastName} supprimé`, "info");
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* 1. TOP STATS CARDS & OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Élèves */}
        <Card className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Effectif Total
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Répartis sur {availableClasses.length} classe(s)
          </p>
        </Card>

        {/* Card 2: Répartition par classe */}
        <Card className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Divisions Scolaires
            </span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-700 tabular-nums">
            {availableClasses.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            {availableClasses.join(" • ") || "Aucune classe"}
          </div>
        </Card>

        {/* Card 3: Élèves en Vigilance */}
        <Card className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Vigilance Assiduité
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 tabular-nums">
            {criticalStudentsCount}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
            {criticalStudentsCount > 0 ? "≥ 3 absences cumulées" : "Aucun élève à risque"}
          </p>
        </Card>

        {/* Card 4: Actions Directes */}
        <Card className="p-3 sm:p-3.5 flex flex-col justify-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddStudent}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="w-full"
          >
            + Nouvel Élève
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenImport}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />}
            className="w-full"
          >
            Importer CSV / Excel
          </Button>
        </Card>
      </div>

      {/* 2. TOOLBAR & FILTERS */}
      <Card className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedClassFilter("ALL")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
              selectedClassFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Toutes ({totalStudents})
          </button>
          {availableClasses.map((cls) => {
            const isSelected = selectedClassFilter === cls;
            const count = students.filter((s) => s.classLevel === cls).length;
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
                {cls} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, tuteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 font-semibold cursor-pointer focus:outline-none"
            >
              <option value="NAME_ASC">Nom (A → Z)</option>
              <option value="NAME_DESC">Nom (Z → A)</option>
              <option value="CLASS">Classe</option>
              <option value="RATE">Assiduité (Plus faible)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 3. STUDENTS LIST TABLE */}
      {filteredAndSortedStudents.length > 0 ? (
        <Card className="overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="sm:col-span-1 text-center">#</div>
            <div className="sm:col-span-4">Élève & Classe</div>
            <div className="sm:col-span-3">Tuteur & Téléphone</div>
            <div className="sm:col-span-2 text-center">Assiduité Mois</div>
            <div className="sm:col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {filteredAndSortedStudents.map((student, idx) => {
              const st = studentStats[student.id] || {
                absent: 0,
                retard: 0,
                present: 0,
                rate: 100,
              };
              const todayStatus = attendance[student.id] || "PRESENT";
              const isCritical = st.absent >= 3;
              const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
              const whatsappUrl = generateParentWhatsAppLink(
                student,
                todayStatus,
                schoolName
              );

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:px-4 sm:py-3 transition-colors flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2.5 sm:gap-3 hover:bg-slate-50/80 ${
                    isCritical ? "bg-rose-50/20" : ""
                  }`}
                >
                  {/* Col 0: Index */}
                  <div className="hidden sm:block sm:col-span-1 text-center text-xs font-mono text-slate-400">
                    {idx + 1}
                  </div>

                  {/* Col 1: Élève */}
                  <div className="sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCritical
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
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
                        <Badge variant="neutral">{student.classLevel}</Badge>
                        {isCritical && (
                          <Badge variant="danger" dot dotPulse>
                            Vigilance
                          </Badge>
                        )}
                      </div>

                      {/* Mobile parent info */}
                      <div className="sm:hidden text-[11px] text-slate-500 mt-0.5">
                        Tuteur : {student.parentName} ({formatPhoneDisplay(student.parentPhone)})
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Tuteur (Desktop) */}
                  <div className="hidden sm:block sm:col-span-3 text-xs">
                    <div className="text-slate-800 font-medium truncate">
                      {student.parentName}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <a
                        href={`tel:+${student.parentPhone}`}
                        className="hover:text-brand-600 transition hover:underline"
                      >
                        {formatPhoneDisplay(student.parentPhone)}
                      </a>
                    </div>
                  </div>

                  {/* Col 3: Assiduité Mois */}
                  <div className="sm:col-span-2 flex items-center sm:justify-center gap-2">
                    <span
                      className={`text-xs font-black tabular-nums ${
                        st.rate < 75
                          ? "text-rose-600"
                          : st.rate < 90
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {st.rate}%
                    </span>

                    <span className="text-[11px] text-slate-400 font-normal">
                      ({st.absent} abs.)
                    </span>
                  </div>

                  {/* Col 4: Actions Buttons */}
                  <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                    {/* WhatsApp */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-slate-200/80 hover:border-emerald-200"
                      title="Contacter le parent sur WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                    </a>

                    {/* Edit */}
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => onOpenEditStudent(student)}
                      title="Modifier les informations de l'élève"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setStudentToDelete(student)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-slate-200/80 hover:border-rose-200"
                      title="Supprimer l'élève de l'établissement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* 4. EMPTY STATE AVEC EXPLICATIONS & ACTIONS */
        <EmptyState
          icon={<Users className="w-6 h-6 text-slate-400" />}
          title={searchQuery ? "Aucun élève trouvé" : "Aucun élève enregistré pour le moment"}
          description={
            searchQuery
              ? `Aucun élève ne correspond à votre recherche "${searchQuery}". Réessayez avec un autre nom.`
              : "Commencez par inscrire un premier élève manuellement ou importez votre liste de classe au format Excel/CSV."
          }
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddStudent}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              + Inscrire un premier élève
            </Button>
          }
          secondaryAction={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenImport}
                leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />}
              >
                Importer un fichier CSV
              </Button>
              {totalStudents === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRestoreDefaults}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Rétablir les 12 élèves de démo
                </Button>
              )}
            </>
          }
        />
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
      {studentToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setStudentToDelete(null)}
          title={`Supprimer l'élève ${studentToDelete.firstName} ${studentToDelete.lastName} ?`}
          description={`Cette action retirera définitivement cet élève de la classe ${studentToDelete.classLevel}.`}
          icon={<Trash2 className="w-4 h-4 text-rose-500" />}
          maxWidth="sm"
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStudentToDelete(null)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={confirmDelete}
              >
                Confirmer la suppression
              </Button>
            </>
          }
        >
          <p className="text-xs text-slate-600 leading-relaxed">
            Êtes-vous sûr de vouloir supprimer cet élève ? Son historique de présence et ses coordonnées seront effacés du registre actif.
          </p>
        </Modal>
      )}

    </div>
  );
};
