import { Student, AttendanceStatus, AttendanceRecord } from "@/types";

export const DEFAULT_ABSENT_TEMPLATE =
  "PointageSN • {Ecole} : Bonjour {Parent}, votre enfant {Eleve} ({Classe}) est constaté ABSENT ce jour sans justification. Merci de contacter la vie scolaire.";

export const DEFAULT_RETARD_TEMPLATE =
  "PointageSN • {Ecole} : Bonjour {Parent}, votre enfant {Eleve} ({Classe}) est arrivé en RETARD ce jour. Merci de veiller au respect des horaires.";

export function formatTemplate(
  template: string,
  student: Student,
  schoolName: string
): string {
  const fullName = `${student.firstName} ${student.lastName}`;
  return template
    .replace(/\{Ecole\}/g, schoolName)
    .replace(/\{Parent\}/g, student.parentName)
    .replace(/\{Eleve\}/g, fullName)
    .replace(/\{Classe\}/g, student.classLevel);
}

export function generateParentWhatsAppLink(
  student: Student,
  status: AttendanceStatus,
  schoolName: string = "Lycée d'Excellence Birago Diop",
  customAbsentTemplate?: string,
  customRetardTemplate?: string
): string {
  const fullName = `${student.firstName} ${student.lastName}`;
  let message = "";

  if (status === "ABSENT") {
    const tpl = customAbsentTemplate || DEFAULT_ABSENT_TEMPLATE;
    message = formatTemplate(tpl, student, schoolName);
  } else if (status === "RETARD") {
    const tpl = customRetardTemplate || DEFAULT_RETARD_TEMPLATE;
    message = formatTemplate(tpl, student, schoolName);
  } else {
    message = `PointageSN • ${schoolName} : Bonjour ${student.parentName}, votre enfant ${fullName} (${student.classLevel}) est bien présent en classe.`;
  }

  const cleanPhone = student.parentPhone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("221") && digits.length === 12) {
    return `+221 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return phone;
}

export function generateDirectionReport(
  selectedClass: string,
  students: Student[],
  attendance: AttendanceRecord,
  schoolName: string = "Lycée d'Excellence Birago Diop",
  sessionDate: string
): string {
  const classStudents = students.filter((s) => s.classLevel === selectedClass);
  const total = classStudents.length;

  const absents = classStudents.filter((s) => (attendance[s.id] || "PRESENT") === "ABSENT");
  const retards = classStudents.filter((s) => (attendance[s.id] || "PRESENT") === "RETARD");
  const presents = classStudents.filter((s) => (attendance[s.id] || "PRESENT") === "PRESENT");

  const attendanceRate = total > 0 ? Math.round(((presents.length + retards.length) / total) * 100) : 100;

  let report = `📋 *RAPPORT DE POINTAGE DE SÉANCE*\n`;
  report += `🏫 *Établissement :* ${schoolName}\n`;
  report += `📅 *Date :* ${sessionDate}\n`;
  report += `📚 *Classe :* ${selectedClass}\n`;
  report += `────────────────────────────\n`;
  report += `📊 *SYNTHÈSE :*\n`;
  report += `• 👥 Effectif : *${total} élève(s)*\n`;
  report += `• ✅ Présents : *${presents.length}*\n`;
  report += `• ❌ Absents : *${absents.length}*\n`;
  report += `• ⏰ Retards : *${retards.length}*\n`;
  report += `• 📈 Taux d'assiduité : *${attendanceRate}%*\n`;
  report += `────────────────────────────\n`;

  if (absents.length > 0) {
    report += `🔴 *ABSENTS (${absents.length}) :*\n`;
    absents.forEach((s, idx) => {
      report += `  ${idx + 1}. ${s.firstName} ${s.lastName} (Tuteur: ${s.parentName} - ${formatPhoneDisplay(s.parentPhone)})\n`;
    });
    report += `\n`;
  } else {
    report += `🟢 *Absents :* Aucun élève absent\n\n`;
  }

  if (retards.length > 0) {
    report += `🟠 *RETARDATAIRES (${retards.length}) :*\n`;
    retards.forEach((s, idx) => {
      report += `  ${idx + 1}. ${s.firstName} ${s.lastName} (Tuteur: ${s.parentName} - ${formatPhoneDisplay(s.parentPhone)})\n`;
    });
    report += `\n`;
  } else {
    report += `🟢 *Retards :* Aucun retard constaté\n\n`;
  }

  report += `────────────────────────────\n`;
  report += `_PointageSN 🇸🇳 • Gestion Scolaire Instantanée_`;

  return report;
}
