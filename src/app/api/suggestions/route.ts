import { NextRequest, NextResponse } from "next/server";
import { listSuggestions, createSuggestion, getDecision } from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const suggestions = listSuggestions({
    status: searchParams.get("status") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    decisionId: searchParams.get("decisionId") ?? undefined,
  });
  return NextResponse.json({ suggestions });
}

export async function POST(request: NextRequest) {
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
  const decisionId =
    typeof data.decisionId === "string" ? data.decisionId : "";
  const body = typeof data.body === "string" ? data.body.trim() : "";

  if (!decisionId || !body) {
    return NextResponse.json(
      { error: "يرجى كتابة المقترح وتحديد القرار المرتبط." },
      { status: 400 }
    );
  }

  if (!getDecision(decisionId)) {
    return NextResponse.json(
      { error: "القرار المرتبط غير موجود." },
      { status: 404 }
    );
  }

  const suggestion = createSuggestion({ decisionId, body });
  return NextResponse.json({ suggestion }, { status: 201 });
}
