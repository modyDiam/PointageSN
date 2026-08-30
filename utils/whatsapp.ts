import { Student, AttendanceStatus, AttendanceRecord } from "@/types";

export function generateParentWhatsAppLink(
  student: Student,
  status: AttendanceStatus,
  schoolName: string = "Lycée d'Excellence Birago Diop"
): string {
  const fullName = `${student.firstName} ${student.lastName}`;
  let message = "";

  if (status === "ABSENT") {
    message = `PointageSN • ${schoolName} : Bonjour ${student.parentName}, votre enfant ${fullName} (${student.classLevel}) est constaté ABSENT ce jour sans justification. Merci de contacter la vie scolaire.`;
  } else if (status === "RETARD") {
    message = `PointageSN • ${schoolName} : Bonjour ${student.parentName}, votre enfant ${fullName} (${student.classLevel}) est arrivé en RETARD ce jour. Merci de veiller au respect des horaires.`;
  } else {
    message = `PointageSN • ${schoolName} : Bonjour ${student.parentName}, votre enfant ${fullName} (${student.classLevel}) est bien présent en classe.`;
  }

  const cleanPhone = student.parentPhone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function formatPhoneDisplay(phone: string): string {
  // Format 221771234567 -> +221 77 123 45 67
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
  report += `📅 *Date & Heure :* ${sessionDate}\n`;
  report += `📚 *Classe :* ${selectedClass}\n`;
  report += `────────────────────────────\n`;
  report += `📊 *SYNTHÈSE GLOBALE :*\n`;
  report += `• 👥 Effectif total : *${total} élève(s)*\n`;
  report += `• ✅ Présents : *${presents.length}*\n`;
  report += `• ❌ Absents : *${absents.length}*\n`;
  report += `• ⏰ Retards : *${retards.length}*\n`;
  report += `• 📈 Taux de présence : *${attendanceRate}%*\n`;
  report += `────────────────────────────\n`;

  if (absents.length > 0) {
    report += `🔴 *LISTE DES ABSENTS (${absents.length}) :*\n`;
    absents.forEach((s, idx) => {
      report += `  ${idx + 1}. ${s.firstName} ${s.lastName} (Parent: ${s.parentName} - ${formatPhoneDisplay(s.parentPhone)})\n`;
    });
    report += `\n`;
  } else {
    report += `🟢 *Absents :* Aucun élève absent\n\n`;
  }

  if (retards.length > 0) {
    report += `🟠 *LISTE DES RETARDATAIRES (${retards.length}) :*\n`;
    retards.forEach((s, idx) => {
      report += `  ${idx + 1}. ${s.firstName} ${s.lastName} (Parent: ${s.parentName} - ${formatPhoneDisplay(s.parentPhone)})\n`;
    });
    report += `\n`;
  } else {
    report += `🟢 *Retards :* Aucun élève en retard\n\n`;
  }

  report += `────────────────────────────\n`;
  report += `_PointageSN 🇸🇳 • Vie Scolaire Digitale & Instantanée_`;

  return report;
}
