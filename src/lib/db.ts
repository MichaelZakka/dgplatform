import {
  store,
  nextDecisionId,
  nextDecisionNumber,
  nextSuggestionId,
} from "./store";
import type {
  Decision,
  DecisionQuery,
  Suggestion,
  SuggestionStatus,
} from "./types";

function sortByDateDesc<T extends { date?: string; createdAt: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const aKey = a.date ?? a.createdAt;
    const bKey = b.date ?? b.createdAt;
    return bKey.localeCompare(aKey);
  });
}

export function listDecisions(query: DecisionQuery = {}): Decision[] {
  const { search, category, governorate, directorate, area, year, month, from } =
    query;
  let results = Array.from(store.decisions.values()).filter(
    (d) => d.status === "published"
  );

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    results = results.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        d.summary.toLowerCase().includes(term) ||
        d.fullText.toLowerCase().includes(term) ||
        d.number.toLowerCase().includes(term)
    );
  }

  if (category && category.trim()) {
    results = results.filter((d) => d.category === category);
  }

  if (governorate && governorate.trim()) {
    results = results.filter((d) => d.governorate === governorate);
  }

  if (directorate && directorate.trim()) {
    results = results.filter((d) => d.directorate === directorate);
  }

  if (area && area.trim()) {
    results = results.filter((d) => d.area === area);
  }

  if (year && year.trim()) {
    results = results.filter((d) => d.date.startsWith(year));
  }

  if (month && month.trim()) {
    // month expected as YYYY-MM
    results = results.filter((d) => d.date.startsWith(month));
  }

  if (from && from.trim()) {
    // from expected as YYYY-MM-DD; include decisions on or after this date
    results = results.filter((d) => d.date >= from);
  }

  return sortByDateDesc(results);
}

export function listAllDecisions(): Decision[] {
  return sortByDateDesc(Array.from(store.decisions.values()));
}

export function getDecision(id: string): Decision | undefined {
  return store.decisions.get(id);
}

export interface CreateDecisionInput {
  title: string;
  summary: string;
  fullText: string;
  category: Decision["category"];
  governorate: string;
  directorate: string;
  area: string;
  date: string;
  pdfUrl?: string;
  status?: Decision["status"];
  number?: string;
}

export function createDecision(input: CreateDecisionInput): Decision {
  const id = nextDecisionId();
  const decision: Decision = {
    id,
    number: input.number?.trim() || nextDecisionNumber(),
    title: input.title,
    summary: input.summary,
    fullText: input.fullText,
    category: input.category,
    governorate: input.governorate,
    directorate: input.directorate,
    area: input.area,
    date: input.date,
    pdfUrl: input.pdfUrl || "",
    status: input.status ?? "published",
    createdAt: new Date().toISOString(),
  };
  store.decisions.set(id, decision);
  return decision;
}

export interface SuggestionQuery {
  category?: string;
  status?: string;
  decisionId?: string;
  date?: string;
}

export interface SuggestionWithDecision extends Suggestion {
  decisionTitle: string;
  decisionNumber: string;
  decisionCategory: Decision["category"] | null;
}

function enrichSuggestion(s: Suggestion): SuggestionWithDecision {
  const decision = store.decisions.get(s.decisionId);
  return {
    ...s,
    decisionTitle: decision?.title ?? "قرار محذوف",
    decisionNumber: decision?.number ?? "—",
    decisionCategory: decision?.category ?? null,
  };
}

export function listSuggestions(
  query: SuggestionQuery = {}
): SuggestionWithDecision[] {
  const { category, status, decisionId, date } = query;
  let results = Array.from(store.suggestions.values()).map(enrichSuggestion);

  if (status && status.trim()) {
    results = results.filter((s) => s.status === status);
  }

  if (category && category.trim()) {
    results = results.filter((s) => s.decisionCategory === category);
  }

  if (decisionId && decisionId.trim()) {
    results = results.filter((s) => s.decisionId === decisionId);
  }

  if (date && date.trim()) {
    results = results.filter((s) => s.createdAt.startsWith(date));
  }

  return sortByDateDesc(results);
}

export function getSuggestionsForDecision(
  decisionId: string
): Suggestion[] {
  return sortByDateDesc(
    Array.from(store.suggestions.values()).filter(
      (s) => s.decisionId === decisionId
    )
  );
}

export interface CreateSuggestionInput {
  decisionId: string;
  email: string;
  body: string;
}

export function hasEmailSubmittedForDecision(
  decisionId: string,
  email: string
): boolean {
  const set = store.submittedEmails?.get(decisionId);
  return set?.has(email.toLowerCase()) ?? false;
}

export function createSuggestion(input: CreateSuggestionInput): Suggestion {
  const id = nextSuggestionId();
  const suggestion: Suggestion = {
    id,
    decisionId: input.decisionId,
    email: input.email.toLowerCase(),
    body: input.body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.suggestions.set(id, suggestion);

  // Track email so the same address cannot submit again for this decision
  const existing = store.submittedEmails.get(input.decisionId) ?? new Set<string>();
  existing.add(input.email.toLowerCase());
  store.submittedEmails.set(input.decisionId, existing);

  return suggestion;
}

export function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus
): Suggestion | undefined {
  const suggestion = store.suggestions.get(id);
  if (!suggestion) return undefined;
  const updated: Suggestion = { ...suggestion, status };
  store.suggestions.set(id, updated);
  return updated;
}

export function deleteSuggestion(id: string): boolean {
  const suggestion = store.suggestions.get(id);
  if (!suggestion) return false;

  store.suggestions.delete(id);

  const emails = store.submittedEmails?.get(suggestion.decisionId);
  if (emails) {
    emails.delete(suggestion.email.toLowerCase());
    if (emails.size === 0) {
      store.submittedEmails.delete(suggestion.decisionId);
    }
  }

  return true;
}

export function deleteDecision(id: string): boolean {
  return store.decisions.delete(id);
}

export function listDraftDecisions(): Decision[] {
  return sortByDateDesc(
    Array.from(store.decisions.values()).filter((d) => d.status === "draft")
  );
}

export function updateDecisionStatus(
  id: string,
  status: Decision["status"]
): Decision | undefined {
  const decision = store.decisions.get(id);
  if (!decision) return undefined;
  const updated: Decision = { ...decision, status };
  store.decisions.set(id, updated);
  return updated;
}

export interface UpdateDecisionInput {
  title?: string;
  summary?: string;
  fullText?: string;
  category?: Decision["category"];
  governorate?: string;
  directorate?: string;
  area?: string;
  date?: string;
  pdfUrl?: string;
  number?: string;
  status?: Decision["status"];
}

export function updateDecision(
  id: string,
  input: UpdateDecisionInput
): Decision | undefined {
  const decision = store.decisions.get(id);
  if (!decision) return undefined;

  const updated: Decision = {
    ...decision,
    title: input.title ?? decision.title,
    summary: input.summary ?? decision.summary,
    fullText: input.fullText ?? decision.fullText,
    category: input.category ?? decision.category,
    governorate: input.governorate ?? decision.governorate,
    directorate: input.directorate ?? decision.directorate,
    area: input.area ?? decision.area,
    date: input.date ?? decision.date,
    pdfUrl: input.pdfUrl ?? decision.pdfUrl,
    number: input.number?.trim() ? input.number.trim() : decision.number,
    status: input.status ?? decision.status,
  };

  store.decisions.set(id, updated);
  return updated;
}

export interface AdminStats {
  totalDecisions: number;
  totalDrafts: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
}

export function getAdminStats(): AdminStats {
  const allDecisions = Array.from(store.decisions.values());
  const suggestions = Array.from(store.suggestions.values());
  return {
    totalDecisions: allDecisions.filter((d) => d.status === "published").length,
    totalDrafts: allDecisions.filter((d) => d.status === "draft").length,
    pendingSuggestions: suggestions.filter((s) => s.status === "pending").length,
    approvedSuggestions: suggestions.filter((s) => s.status === "approved").length,
  };
}
