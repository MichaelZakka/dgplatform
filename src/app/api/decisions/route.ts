import { NextRequest, NextResponse } from "next/server";
import { listDecisions, createDecision } from "@/lib/db";
import { CATEGORIES, type Category } from "@/lib/types";
import { isValidGovernorate } from "@/lib/locations";
import { requireAdminApi } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const decisions = await listDecisions({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    governorate: searchParams.get("governorate") ?? undefined,
    directorate: searchParams.get("directorate") ?? undefined,
    area: searchParams.get("area") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    from: searchParams.get("from") ?? undefined,
  });
  return NextResponse.json({ decisions });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "صيغة الطلب غير صحيحة." },
      { status: 400 }
    );
  }

  const data = payload as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  const fullText =
    typeof data.fullText === "string" ? data.fullText.trim() : "";
  const category = data.category as Category;
  const governorate =
    typeof data.governorate === "string" ? data.governorate.trim() : "";
  const directorate =
    typeof data.directorate === "string" ? data.directorate.trim() : "";
  const area = typeof data.area === "string" ? data.area.trim() : "";
  const date = typeof data.date === "string" ? data.date : "";
  const pdfUrl = typeof data.pdfUrl === "string" ? data.pdfUrl : "";
  const number = typeof data.number === "string" ? data.number : "";
  const status = data.status === "draft" ? "draft" : "published";
  const isDraft = status === "draft";

  // Title is always required
  if (!title) {
    return NextResponse.json(
      { error: "يرجى إدخال عنوان القرار على الأقل." },
      { status: 400 }
    );
  }

  // All other fields are required only for published decisions
  if (!isDraft) {
    if (!summary || !fullText || !date || !governorate) {
      return NextResponse.json(
        { error: "يرجى تعبئة جميع الحقول المطلوبة." },
        { status: 400 }
      );
    }

    if (!CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "التصنيف المحدد غير صالح." },
        { status: 400 }
      );
    }

    if (!isValidGovernorate(governorate)) {
      return NextResponse.json(
        { error: "المحافظة المحددة غير صالحة." },
        { status: 400 }
      );
    }
  }

  const decision = await createDecision({
    title,
    summary: summary || "",
    fullText: fullText || "",
    category: CATEGORIES.includes(category) ? category : CATEGORIES[0],
    governorate: governorate || "",
    directorate: directorate || "",
    area: area || "",
    date: date || new Date().toISOString().slice(0, 10),
    pdfUrl,
    number,
    status,
  });

  return NextResponse.json({ decision }, { status: 201 });
}
