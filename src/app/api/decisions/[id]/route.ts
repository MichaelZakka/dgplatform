import { NextResponse } from "next/server";
import { getDecision } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/decisions/[id]">
) {
  const { id } = await ctx.params;
  const decision = getDecision(id);

  if (!decision) {
    return NextResponse.json(
      { error: "القرار غير موجود." },
      { status: 404 }
    );
  }

  return NextResponse.json({ decision });
}
