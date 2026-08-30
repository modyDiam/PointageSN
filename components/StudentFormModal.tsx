"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  UserCheck,
  User,
  Building,
  Phone,
  Check,
  Sparkles,
} from "lucide-react";
import { Student } from "@/types";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  availableClasses: string[];
  onSaveStudent: (studentData: Omit<Student, "id"> & { id?: string }) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  availableClasses,
  onSaveStudent,
  onShowToast,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [classLevel, setClassLevel] = useState("6e A");
  const [customClass, setCustomClass] = useState("");
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  useEffect(() => {
    if (studentToEdit) {
      setFirstName(studentToEdit.firstName);
      setLastName(studentToEdit.lastName);
      if (availableClasses.includes(studentToEdit.classLevel)) {
        setClassLevel(studentToEdit.classLevel);
        setIsCustomClass(false);
      } else {
        setIsCustomClass(true);
        setCustomClass(studentToEdit.classLevel);
      }
      setParentName(studentToEdit.parentName);
      setParentPhone(studentToEdit.parentPhone.replace(/^221/, ""));
    } else {
      setFirstName("");
      setLastName("");
      setClassLevel(availableClasses[0] || "6e A");
      setCustomClass("");
      setIsCustomClass(false);
      setParentName("");
      setParentPhone("");
    }
  }, [studentToEdit, availableClasses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      onShowToast("Veuillez renseigner le prénom et le nom de l'élève.", "warning");
      return;
    }

    const finalClass = isCustomClass
      ? customClass.trim() || "6e A"
      : classLevel;

    let cleanPhone = parentPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone.startsWith("221") && cleanPhone.length === 9) {
      cleanPhone = "221" + cleanPhone;
    } else if (!cleanPhone.startsWith("221") && cleanPhone.length > 0) {
      cleanPhone = "221" + cleanPhone;
    }

    if (!cleanPhone) {
      cleanPhone = "221770000000";
    }

    onSaveStudent({
      id: studentToEdit ? studentToEdit.id : undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      classLevel: finalClass,
      parentName: parentName.trim() || "Tuteur légal",
      parentPhone: cleanPhone,
    });

    onShowToast(
      studentToEdit
        ? `Fiche de ${firstName} mise à jour avec succès !`
        : `Élève ${firstName} ${lastName} ajouté avec succès !`,
      "success"
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-modal overflow-hidden animate-scale-up my-6">
        
        {/* Header */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              {studentToEdit ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {studentToEdit ? "Modifier la fiche élève" : "Inscrire un nouvel élève"}
              </h2>
              <p className="text-[11px] text-slate-500">
                Informations administratives et contact parental
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
          
          {/* SECTION 1: IDENTITÉ ÉLÈVE */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-brand-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Identité de l'Élève
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Prénom */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Prénom <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Moussa"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                  required
                />
              </div>

              {/* Nom */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nom de famille <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Diop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Classe */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Classe / Division <span className="text-rose-600">*</span></span>
                <button
                  type="button"
                  onClick={() => setIsCustomClass(!isCustomClass)}
                  className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
                >
                  {isCustomClass ? "Choisir existante" : "+ Nouvelle classe"}
                </button>
              </label>

              {isCustomClass ? (
                <input
                  type="text"
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  placeholder="Ex: 5e B, 1ère L2, Seconde C..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                  required
                />
              ) : (
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Classe {cls}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* SECTION 2: RESPONSABLE LÉGAL */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Responsable Légal & Contact WhatsApp
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Nom du Tuteur / Parent
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Ex: Mamadou Diop"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Numéro WhatsApp (Sénégal) <span className="text-rose-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 select-none">
                  +221
                </span>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="77 750 15 65"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Les alertes automatiques d'absence et de retard seront envoyées à ce numéro.
              </p>
            </div>
          </div>

          {/* Footer Actions inside form */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-navy-900 hover:bg-navy-800 text-white rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{studentToEdit ? "Enregistrer les modifications" : "Ajouter l'élève"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
