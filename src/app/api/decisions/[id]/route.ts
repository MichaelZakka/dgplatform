import { NextResponse } from "next/server";
import { getDecision, deleteDecision, updateDecision } from "@/lib/db";
import { CATEGORIES, type Category } from "@/lib/types";
import { isValidGovernorate } from "@/lib/locations";
import { requireAdminApi } from "@/lib/auth";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/decisions/[id]">
) {
  const { id } = await ctx.params;
  const decision = await getDecision(id);

  if (!decision) {
    return NextResponse.json(
      { error: "القرار غير موجود." },
      { status: 404 }
    );
  }

  return NextResponse.json({ decision });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/decisions/[id]">
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await ctx.params;
  const existing = await getDecision(id);
  if (!existing) {
    return NextResponse.json({ error: "القرار غير موجود." }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;
  const title =
    typeof data.title === "string" ? data.title.trim() : existing.title;
  const summary =
    typeof data.summary === "string" ? data.summary.trim() : existing.summary;
  const fullText =
    typeof data.fullText === "string" ? data.fullText.trim() : existing.fullText;
  const category = (data.category as Category) ?? existing.category;
  const governorate =
    typeof data.governorate === "string"
      ? data.governorate.trim()
      : existing.governorate;
  const directorate =
    typeof data.directorate === "string"
      ? data.directorate.trim()
      : existing.directorate;
  const area =
    typeof data.area === "string" ? data.area.trim() : existing.area;
  const date = typeof data.date === "string" ? data.date : existing.date;
  const pdfUrl =
    typeof data.pdfUrl === "string" ? data.pdfUrl : existing.pdfUrl;
  const number = typeof data.number === "string" ? data.number : existing.number;
  const status =
    data.status === "draft" || data.status === "published"
      ? data.status
      : existing.status;
  const isDraft = status === "draft";

  if (!title) {
    return NextResponse.json(
      { error: "يرجى إدخال عنوان القرار على الأقل." },
      { status: 400 }
    );
  }

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

  const updated = await updateDecision(id, {
    title,
    summary: summary || "",
    fullText: fullText || "",
    category: CATEGORIES.includes(category) ? category : existing.category,
    governorate: governorate || "",
    directorate: directorate || "",
    area: area || "",
    date: date || new Date().toISOString().slice(0, 10),
    pdfUrl,
    number,
    status,
  });

  return NextResponse.json({ decision: updated });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/decisions/[id]">
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await ctx.params;

  if (!(await getDecision(id))) {
    return NextResponse.json(
      { error: "القرار غير موجود." },
      { status: 404 }
    );
  }

  await deleteDecision(id);
  return new NextResponse(null, { status: 204 });
}
