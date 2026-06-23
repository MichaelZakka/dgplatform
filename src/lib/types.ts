export type Category = "خدمات" | "إعمار" | "صحة" | "نقل" | "تعليم";

export const CATEGORIES: Category[] = [
  "خدمات",
  "إعمار",
  "صحة",
  "نقل",
  "تعليم",
];

export type SuggestionStatus = "pending" | "approved" | "rejected";

export type DecisionStatus = "draft" | "published";

export interface Suggestion {
  id: string;
  decisionId: string;
  body: string;
  status: SuggestionStatus;
  createdAt: string;
}

export interface Decision {
  id: string;
  number: string;
  title: string;
  summary: string;
  fullText: string;
  category: Category;
  governorate: string;
  directorate: string;
  area: string;
  date: string;
  pdfUrl: string;
  status: DecisionStatus;
  createdAt: string;
}

export interface DecisionQuery {
  search?: string;
  category?: string;
  governorate?: string;
  directorate?: string;
  area?: string;
  year?: string;
  month?: string;
  from?: string;
}
