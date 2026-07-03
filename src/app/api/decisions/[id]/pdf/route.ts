import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getDecision } from "@/lib/db";
import { buildSimplePdf, decisionPdfFilename } from "@/lib/pdf";

async function readStoredPdf(pdfUrl: string): Promise<Uint8Array | null> {
  if (!pdfUrl || pdfUrl.startsWith("http")) {
    return null;
  }

  const relativePath = pdfUrl.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relativePath);

  try {
    const buffer = await readFile(filePath);
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
