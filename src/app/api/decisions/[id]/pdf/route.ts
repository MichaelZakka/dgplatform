import { NextResponse } from "next/server";
import { getDecision } from "@/lib/db";
import { buildSimplePdf, decisionPdfFilename } from "@/lib/pdf";

async function readStoredPdf(pdfUrl: string): Promise<Uint8Array | null> {
  if (!pdfUrl) return null;

  if (pdfUrl.startsWith("http")) {
    try {
      const res = await fetch(pdfUrl);
      if (!res.ok) return null;
      return new Uint8Array(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  // Legacy: local filesystem path (dev only)
  try {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const buffer = await readFile(join(process.cwd(), "public", pdfUrl.replace(/^\//, "")));
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/decisions/[id]/pdf">
) {
  const { id } = await ctx.params;
  const decision = await getDecision(id);

  if (!decision || decision.status !== "published") {
    return NextResponse.json(
      { error: "القرار غير موجود." },
      { status: 404 }
    );
  }

  const filename = decisionPdfFilename(decision.number);
  const stored = decision.pdfUrl ? await readStoredPdf(decision.pdfUrl) : null;
  const pdfBytes =
    stored ??
    buildSimplePdf([
      `Decision No. ${decision.number}`,
      decision.title,
      decision.date,
      "",
      decision.fullText,
    ]);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
