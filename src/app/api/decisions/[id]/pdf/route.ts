import { NextResponse } from "next/server";
import { getDecision } from "@/lib/db";
import { buildSimplePdf, decisionPdfFilename } from "@/lib/pdf";

export const dynamic = "force-dynamic";

async function readStoredPdf(
  pdfUrl: string,
  origin: string
): Promise<Uint8Array | null> {
  if (!pdfUrl) return null;

  // Resolve the fetch target: absolute (blob) URLs are used as-is, while
  // legacy local paths (e.g. "/files/decisions/...") are served statically
  // by the CDN — read them over HTTP instead of the filesystem, which is not
  // reliably available inside serverless functions on Vercel.
  const target = pdfUrl.startsWith("http")
    ? pdfUrl
    : `${origin}/${pdfUrl.replace(/^\//, "")}`;

  try {
    const res = await fetch(target, { cache: "no-store" });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
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
  const origin = new URL(request.url).origin;
  const stored = decision.pdfUrl
    ? await readStoredPdf(decision.pdfUrl, origin)
    : null;
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
      "Cache-Control": "no-store",
    },
  });
}
