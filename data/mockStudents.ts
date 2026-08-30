import { Student } from "@/types";

export const AVAILABLE_CLASSES = ["6e A", "3e A", "Tle S2"] as const;

export const DEFAULT_SCHOOL_NAME = "Lycée d'Excellence Birago Diop (Dakar)";

export const mockStudents: Student[] = [
  // Classe : 6e A
  {
    id: "stu-6a-01",
    firstName: "Moussa",
    lastName: "Diop",
    classLevel: "6e A",
    parentName: "Mamadou Diop",
    parentPhone: "221777501565",
  },
  {
    id: "stu-6a-02",
    firstName: "Fatou",
    lastName: "Ndiaye",
    classLevel: "6e A",
    parentName: "Awa Ndiaye",
    parentPhone: "221772345678",
  },
  {
    id: "stu-6a-03",
    firstName: "Ibrahima",
    lastName: "Sow",
    classLevel: "6e A",
    parentName: "Oumar Sow",
    parentPhone: "221783456789",
  },
  {
    id: "stu-6a-04",
    firstName: "Aïssatou",
    lastName: "Fall",
    classLevel: "6e A",
    parentName: "Coumba Fall",
    parentPhone: "221764567890",
  },

  // Classe : 3e A
  {
    id: "stu-3a-01",
    firstName: "Babacar",
    lastName: "Cissé",
    classLevel: "3e A",
    parentName: "Alioune Cissé",
    parentPhone: "221775678901",
  },
  {
    id: "stu-3a-02",
    firstName: "Mariama",
    lastName: "Diallo",
    classLevel: "3e A",
    parentName: "Thierno Diallo",
    parentPhone: "221786789012",
  },
  {
    id: "stu-3a-03",
    firstName: "Cheikh",
    lastName: "Sarr",
    classLevel: "3e A",
    parentName: "Khadidiatou Sarr",
    parentPhone: "221707890123",
  },
  {
    id: "stu-3a-04",
    firstName: "Aminata",
    lastName: "Ba",
    classLevel: "3e A",
    parentName: "Abdoulaye Ba",
    parentPhone: "221778901234",
  },

  // Classe : Tle S2
  {
    id: "stu-ts2-01",
    firstName: "Ousmane",
    lastName: "Gueye",
    classLevel: "Tle S2",
    parentName: "Pape Gueye",
    parentPhone: "221779012345",
  },
  {
    id: "stu-ts2-02",
    firstName: "Khady",
    lastName: "Touré",
    classLevel: "Tle S2",
    parentName: "Astou Touré",
    parentPhone: "221780123456",
  },
  {
    id: "stu-ts2-03",
    firstName: "Modou",
    lastName: "Mbaye",
    classLevel: "Tle S2",
    parentName: "El Hadji Mbaye",
    parentPhone: "221761234567",
  },
  {
    id: "stu-ts2-04",
    firstName: "Ndèye",
    lastName: "Faye",
    classLevel: "Tle S2",
    parentName: "Moustapha Faye",
    parentPhone: "221702345678",
  },
];
