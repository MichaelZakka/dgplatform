import { NextResponse } from "next/server";
import {
  updateSuggestionStatus,
  deleteSuggestion,
  isSuggestionStatus,
} from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/suggestions/[id]">
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await ctx.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "صيغة الطلب غير صحيحة." },
      { status: 400 }
    );
  }

  const status = (payload as Record<string, unknown>).status;
  if (!isSuggestionStatus(status)) {
    return NextResponse.json(
      { error: "الحالة المحددة غير صالحة." },
      { status: 400 }
    );
  }

  const updated = await updateSuggestionStatus(id, status);
  if (!updated) {
    return NextResponse.json(
      { error: "المقترح غير موجود." },
      { status: 404 }
    );
  }

  return NextResponse.json({ suggestion: updated });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/suggestions/[id]">
) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await ctx.params;
  const removed = await deleteSuggestion(id);

  if (!removed) {
    return NextResponse.json(
      { error: "المقترح غير موجود." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
