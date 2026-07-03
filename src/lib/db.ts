import { prisma } from "./prisma";
import type {
  Decision,
  DecisionQuery,
  Suggestion,
  SuggestionStatus,
} from "./types";

// ---------------------------------------------------------------------------
// Row → domain mappers
// The database stores `createdAt` as a DateTime; the app types expect an ISO
// string. `category` / `status` are stored as plain strings and narrowed here.
// ---------------------------------------------------------------------------

interface DecisionRow {
  id: string;
  number: string;
  title: string;
  summary: string;
  fullText: string;
  category: string;
  governorate: string;
  directorate: string;
  area: string;
  date: string;
  pdfUrl: string;
  status: string;
  createdAt: Date;
}

interface SuggestionRow {
  id: string;
  decisionId: string;
  email: string;
  body: string;
  status: string;
  createdAt: Date;
}

function toDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    summary: row.summary,
    fullText: row.fullText,
    category: row.category as Decision["category"],
    governorate: row.governorate,
    directorate: row.directorate,
    area: row.area,
    date: row.date,
    pdfUrl: row.pdfUrl,
    status: row.status as Decision["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

function toSuggestion(row: SuggestionRow): Suggestion {
  return {
    id: row.id,
    decisionId: row.decisionId,
    email: row.email,
    body: row.body,
    status: row.status as SuggestionStatus,
    createdAt: row.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export async function listDecisions(
  query: DecisionQuery = {}
): Promise<Decision[]> {
  const { search, category, governorate, directorate, area, year, month, from } =
    query;

  const where: Record<string, unknown> = { status: "published" };

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term } },
      { summary: { contains: term } },
      { fullText: { contains: term } },
      { number: { contains: term } },
    ];
  }

  if (category && category.trim()) where.category = category;
  if (governorate && governorate.trim()) where.governorate = governorate;
  if (directorate && directorate.trim()) where.directorate = directorate;
  if (area && area.trim()) where.area = area;

  // `date` is stored as a YYYY-MM-DD string, so prefix/range matching works.
  if (month && month.trim()) {
    where.date = { startsWith: month };
  } else if (year && year.trim()) {
    where.date = { startsWith: year };
  }
  if (from && from.trim()) {
    where.date = { ...(where.date as object), gte: from };
  }

  const rows = await prisma.decision.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toDecision);
}

export async function listAllDecisions(): Promise<Decision[]> {
  const rows = await prisma.decision.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toDecision);
}

export async function getDecision(id: string): Promise<Decision | undefined> {
  const row = await prisma.decision.findUnique({ where: { id } });
  return row ? toDecision(row) : undefined;
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

async function nextDecisionNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.decision.count();
  return `${year}/${String(count + 1).padStart(3, "0")}`;
}

export async function createDecision(
  input: CreateDecisionInput
): Promise<Decision> {
  const number = input.number?.trim() || (await nextDecisionNumber());
  const row = await prisma.decision.create({
    data: {
      number,
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
    },
  });
  return toDecision(row);
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

export async function updateDecision(
  id: string,
  input: UpdateDecisionInput
): Promise<Decision | undefined> {
  try {
    const row = await prisma.decision.update({
      where: { id },
      data: {
        title: input.title,
        summary: input.summary,
        fullText: input.fullText,
        category: input.category,
        governorate: input.governorate,
        directorate: input.directorate,
        area: input.area,
        date: input.date,
        pdfUrl: input.pdfUrl,
        number: input.number?.trim() ? input.number.trim() : undefined,
        status: input.status,
      },
    });
    return toDecision(row);
  } catch {
    return undefined;
  }
}

export async function updateDecisionStatus(
  id: string,
  status: Decision["status"]
): Promise<Decision | undefined> {
  try {
    const row = await prisma.decision.update({
      where: { id },
      data: { status },
    });
    return toDecision(row);
  } catch {
    return undefined;
  }
}

export async function deleteDecision(id: string): Promise<boolean> {
  try {
    await prisma.decision.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function listDraftDecisions(): Promise<Decision[]> {
  const rows = await prisma.decision.findMany({
    where: { status: "draft" },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toDecision);
}

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

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

export async function listSuggestions(
  query: SuggestionQuery = {}
): Promise<SuggestionWithDecision[]> {
  const { category, status, decisionId, date } = query;

  const where: Record<string, unknown> = {};
  if (status && status.trim()) where.status = status;
  if (decisionId && decisionId.trim()) where.decisionId = decisionId;
  if (category && category.trim()) where.decision = { category };
  if (date && date.trim()) {
    const start = new Date(`${date}T00:00:00.000Z`);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      where.createdAt = { gte: start, lt: end };
    }
  }

  const rows = await prisma.suggestion.findMany({
    where,
    include: { decision: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    ...toSuggestion(row),
    decisionTitle: row.decision?.title ?? "قرار محذوف",
    decisionNumber: row.decision?.number ?? "—",
    decisionCategory:
      (row.decision?.category as Decision["category"] | undefined) ?? null,
  }));
}

export async function getSuggestionsForDecision(
  decisionId: string
): Promise<Suggestion[]> {
  const rows = await prisma.suggestion.findMany({
    where: { decisionId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toSuggestion);
}

export interface CreateSuggestionInput {
  decisionId: string;
  email: string;
  body: string;
}

export async function hasEmailSubmittedForDecision(
  decisionId: string,
  email: string
): Promise<boolean> {
  const existing = await prisma.suggestion.findFirst({
    where: { decisionId, email: email.toLowerCase() },
    select: { id: true },
  });
  return existing !== null;
}

export async function createSuggestion(
  input: CreateSuggestionInput
): Promise<Suggestion> {
  const row = await prisma.suggestion.create({
    data: {
      decisionId: input.decisionId,
      email: input.email.toLowerCase(),
      body: input.body,
      status: "pending",
    },
  });
  return toSuggestion(row);
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus
): Promise<Suggestion | undefined> {
  try {
    const row = await prisma.suggestion.update({
      where: { id },
      data: { status },
    });
    return toSuggestion(row);
  } catch {
    return undefined;
  }
}

export async function deleteSuggestion(id: string): Promise<boolean> {
  try {
    await prisma.suggestion.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export function isSuggestionStatus(value: unknown): value is SuggestionStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

// ---------------------------------------------------------------------------
// Admin stats
// ---------------------------------------------------------------------------

export interface AdminStats {
  totalDecisions: number;
  totalDrafts: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [totalDecisions, totalDrafts, pendingSuggestions, approvedSuggestions] =
    await Promise.all([
      prisma.decision.count({ where: { status: "published" } }),
      prisma.decision.count({ where: { status: "draft" } }),
      prisma.suggestion.count({ where: { status: "pending" } }),
      prisma.suggestion.count({ where: { status: "approved" } }),
    ]);

  return {
    totalDecisions,
    totalDrafts,
    pendingSuggestions,
    approvedSuggestions,
  };
}
