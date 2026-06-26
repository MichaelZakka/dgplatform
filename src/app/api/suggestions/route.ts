import { NextRequest, NextResponse } from "next/server";
import {
  listSuggestions,
  createSuggestion,
  getDecision,
  hasEmailSubmittedForDecision,
} from "@/lib/db";
import { verifyCaptcha } from "@/lib/captcha";
import { requireAdminApi } from "@/lib/auth";

const MAX_BODY = 250;
// Arabic letters + Arabic-Extended + Arabic punctuation + whitespace + common punctuation
const ARABIC_ONLY = /^[\u0600-\u06FF\s\u060C\u061B\u061F.,!:()\-«»]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const suggestions = listSuggestions({
    status: searchParams.get("status") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    decisionId: searchParams.get("decisionId") ?? undefined,
    date: searchParams.get("date") ?? undefined,
  });
  return NextResponse.json({ suggestions });
}

export async function POST(request: NextRequest) {
  try {
    return await handlePost(request);
  } catch (err) {
    console.error("[POST /api/suggestions] unexpected error:", err);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع في الخادم. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}

async function handlePost(request: NextRequest) {
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
    typeof data.decisionId === "string" ? data.decisionId.trim() : "";
  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const body =
    typeof data.body === "string" ? data.body.trim() : "";
  const captchaId =
    typeof data.captchaId === "string" ? data.captchaId.trim() : "";
  // Honeypot: bots fill hidden fields, humans never see it
  const honeypot =
    typeof data._hp === "string" ? data._hp : "";

  // Required fields
  if (!decisionId || !email || !body) {
    return NextResponse.json(
      { error: "يرجى تعبئة جميع الحقول المطلوبة." },
      { status: 400 }
    );
  }

  // Email format
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "البريد الإلكتروني غير صالح." },
      { status: 400 }
    );
  }

  // Arabic only
  if (!ARABIC_ONLY.test(body)) {
    return NextResponse.json(
      { error: "يُقبل النص العربي فقط في حقل المقترح." },
      { status: 400 }
    );
  }

  // 250 character limit
  if (body.length > MAX_BODY) {
    return NextResponse.json(
      { error: `يجب ألا يتجاوز المقترح ${MAX_BODY} حرفاً.` },
      { status: 400 }
    );
  }

  // Honeypot check — reject silently if filled
  if (honeypot) {
    return NextResponse.json({ suggestion: null }, { status: 201 });
  }

  // CAPTCHA token
  if (!captchaId) {
    return NextResponse.json(
      { error: "يرجى إتمام التحقق أولاً." },
      { status: 400 }
    );
  }
  if (!verifyCaptcha(captchaId)) {
    return NextResponse.json(
      { error: "انتهت صلاحية التحقق. يرجى المحاولة مرة أخرى." },
      { status: 400 }
    );
  }

  // Decision exists
  if (!getDecision(decisionId)) {
    return NextResponse.json(
      { error: "القرار المرتبط غير موجود." },
      { status: 404 }
    );
  }

  // One suggestion per email per decision
  if (hasEmailSubmittedForDecision(decisionId, email)) {
    return NextResponse.json(
      { error: "لقد أرسلت مقترحاً لهذا القرار مسبقاً باستخدام هذا البريد الإلكتروني." },
      { status: 409 }
    );
  }

  const suggestion = createSuggestion({ decisionId, email, body });
  return NextResponse.json({ suggestion }, { status: 201 });
}
