import { Student } from "@/types";

export function parseStudentsCSV(csvText: string): { students: Student[]; errors: string[] } {
  const lines = csvText.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
  const students: Student[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    errors.push("Le fichier est vide.");
    return { students, errors };
  }

  // Detect delimiter (, or ; or \t)
  const firstLine = lines[0];
  let delimiter = ",";
  if (firstLine.includes(";")) delimiter = ";";
  else if (firstLine.includes("\t")) delimiter = "\t";

  // Check if first row is header
  const headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  
  let startIndex = 0;
  let firstNameIdx = 0;
  let lastNameIdx = 1;
  let classIdx = 2;
  let parentIdx = 3;
  let phoneIdx = 4;

  const isHeaderRow = headers.some((h) =>
    h.includes("prenom") || h.includes("nom") || h.includes("classe") || h.includes("parent") || h.includes("tel")
  );

  if (isHeaderRow) {
    startIndex = 1;
    headers.forEach((h, idx) => {
      if (h.includes("prenom") || h === "first" || h === "firstname") firstNameIdx = idx;
      else if (h.includes("nom") || h === "last" || h === "lastname") lastNameIdx = idx;
      else if (h.includes("classe") || h.includes("niveau") || h === "class") classIdx = idx;
      else if (h.includes("parent") || h.includes("tuteur")) parentIdx = idx;
      else if (h.includes("tel") || h.includes("phone") || h.includes("mobile") || h.includes("whatsapp")) phoneIdx = idx;
    });
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = rawLine.split(delimiter).map((c) => c.replace(/^["']|["']$/g, "").trim());
    if (cols.length < 3) {
      errors.push(`Ligne ${i + 1} ignorée (colonnes insuffisantes) : ${rawLine}`);
      continue;
    }

    const firstName = cols[firstNameIdx] || "";
    const lastName = cols[lastNameIdx] || "";
    const classLevel = cols[classIdx] || "6e A";
    const parentName = cols[parentIdx] || "Tuteur";
    let parentPhone = (cols[phoneIdx] || "221770000000").replace(/[^0-9]/g, "");

    if (!parentPhone.startsWith("221") && parentPhone.length === 9) {
      parentPhone = "221" + parentPhone;
    }

    if (!firstName && !lastName) {
      continue;
    }

    const id = `stu-imp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
    students.push({
      id,
      firstName,
      lastName,
      classLevel,
      parentName,
      parentPhone,
    });
  }

  return { students, errors };
}

export function exportMonthlyRegisterCSV(
  students: Student[],
  monthlyStats: Record<string, { absent: number; retard: number; present: number }>,
  selectedClass?: string
): void {
  const filtered = selectedClass && selectedClass !== "ALL"
    ? students.filter((s) => s.classLevel === selectedClass)
    : students;

  let csvContent = "\uFEFF"; // UTF-8 BOM for Excel
  csvContent += "Classe;Prenom;Nom;Tuteur;Telephone;Total Absences;Total Retards;Total Presences\n";

  filtered.forEach((s) => {
    const st = monthlyStats[s.id] || { absent: 0, retard: 0, present: 0 };
    csvContent += `"${s.classLevel}";"${s.firstName}";"${s.lastName}";"${s.parentName}";"${s.parentPhone}";${st.absent};${st.retard};${st.present}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `registre_pointagesn_${selectedClass || "toutes_classes"}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const SAMPLE_CSV_TEMPLATE = `Prenom;Nom;Classe;Parent;Telephone
Moussa;Diop;6e A;Mamadou Diop;221777501565
Fatou;Ndiaye;6e A;Awa Ndiaye;221772345678
Babacar;Cisse;3e A;Alioune Cisse;221775678901
Ousmane;Gueye;Tle S2;Pape Gueye;221779012345`;
