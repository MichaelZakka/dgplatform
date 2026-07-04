import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "لم يُرفق ملف." }, { status: 400 });
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "يُقبل ملف PDF فقط." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "حجم الملف كبير جداً. الحد الأقصى 20 ميغابايت." },
      { status: 400 }
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._\-]/g, "_");
  const filename = `decisions/${Date.now()}-${safeName}`;

  const blob = await put(filename, file, { access: "public" });

  return NextResponse.json({ pdfUrl: blob.url });
}
