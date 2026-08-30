"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, User, Phone, Check } from "lucide-react";
import { Student } from "@/types";
import { Modal, Input, Select, Button } from "@/components/ui";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? "Modifier la fiche élève" : "Inscrire un nouvel élève"}
      description="Informations administratives et contact parental"
      icon={studentToEdit ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            onClick={handleSubmit}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {studentToEdit ? "Enregistrer les modifications" : "Ajouter l'élève"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECTION 1: IDENTITÉ ÉLÈVE */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
            <User className="w-3.5 h-3.5 text-brand-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Identité de l'Élève
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Prénom"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex: Moussa"
            />
            <Input
              label="Nom de famille"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Ex: Diop"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Classe / Division <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomClass(!isCustomClass)}
                className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
              >
                {isCustomClass ? "Choisir existante" : "+ Nouvelle classe"}
              </button>
            </div>

            {isCustomClass ? (
              <Input
                required
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                placeholder="Ex: 5e B, 1ère L2, Seconde C..."
              />
            ) : (
              <Select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Classe {cls}
                  </option>
                ))}
              </Select>
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

          <Input
            label="Nom du Tuteur / Parent"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Ex: Mamadou Diop"
          />

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
      </form>
    </Modal>
  );
};
