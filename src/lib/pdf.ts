function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Builds a minimal valid PDF (Helvetica, Latin text) for prototype downloads.
 */
export function buildSimplePdf(lines: string[]): Uint8Array {
  const sanitized = lines
    .map((line) => line.replace(/[^\x20-\x7E]/g, " ").trim())
    .filter(Boolean)
    .slice(0, 40);

  const textOps = sanitized
    .map((line, index) => {
      const y = 740 - index * 18;
      return `1 0 0 1 72 ${y} Tm (${escapePdfText(line)}) Tj`;
    })
    .join("\n");

  const stream = `BT\n/F1 12 Tf\n${textOps}\nET`;
  const streamLength = Buffer.byteLength(stream, "utf8");

  const objects = [
    "",
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let i = 1; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += objects[i];
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new Uint8Array(Buffer.from(pdf, "utf8"));
}

export function decisionPdfFilename(number: string): string {
  return `decision-${number.replace(/\//g, "-")}.pdf`;
}
