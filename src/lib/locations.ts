/**
 * Syrian administrative hierarchy used by the location filters:
 * المحافظة (governorate) → المديرية (directorate) → الناحية/المنطقة (area).
 */
export interface Directorate {
  name: string;
  areas: string[];
}

export interface Governorate {
  name: string;
  directorates: Directorate[];
}

export const GOVERNORATES: Governorate[] = [
  {
    name: "محافظة دمشق",
    directorates: [
      {
        name: "مديرية المنطقة الأولى",
        areas: ["القنوات", "سوق ساروجة", "الصالحية", "الحريقة"],
      },
      {
        name: "مديرية المهاجرين",
        areas: ["المهاجرين", "الروضة", "أبو رمانة", "ركن الدين"],
      },
      {
        name: "مديرية المزة",
        areas: ["المزة", "كفر سوسة", "دمر", "المزة 86"],
      },
      {
        name: "مديرية الميدان",
        areas: ["الميدان", "القدم", "العسالي", "الزاهرة"],
      },
      {
        name: "مديرية برزة",
        areas: ["برزة", "القابون", "الشيخ سعد", "عش الورور"],
      },
      {
        name: "مديرية باب توما",
        areas: ["باب توما", "القصاع", "باب شرقي", "الشاغور"],
      },
    ],
  },
  {
    name: "محافظة ريف دمشق",
    directorates: [
      {
        name: "مديرية دوما",
        areas: ["دوما", "حرستا", "عربين", "مسرابا"],
      },
      {
        name: "مديرية داريا",
        areas: ["داريا", "المعضمية", "صحنايا", "جديدة عرطوز"],
      },
      {
        name: "مديرية التل",
        areas: ["التل", "منين", "صيدنايا", "رنكوس"],
      },
      {
        name: "مديرية يبرود",
        areas: ["يبرود", "النبك", "دير عطية", "قارة"],
      },
    ],
  },
];

export const GOVERNORATE_NAMES: string[] = GOVERNORATES.map((g) => g.name);

export function getDirectorates(governorate: string): string[] {
  const gov = GOVERNORATES.find((g) => g.name === governorate);
  return gov ? gov.directorates.map((d) => d.name) : [];
}

export function getAreas(governorate: string, directorate: string): string[] {
  const gov = GOVERNORATES.find((g) => g.name === governorate);
  if (!gov) return [];
  const dir = gov.directorates.find((d) => d.name === directorate);
  return dir ? dir.areas : [];
}

export function isValidGovernorate(name: string): boolean {
  return GOVERNORATE_NAMES.includes(name);
}
