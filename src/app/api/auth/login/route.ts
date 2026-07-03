import { NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "صيغة الطلب غير صحيحة." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;
  const username = typeof data.username === "string" ? data.username.trim() : "";
  const password = typeof data.password === "string" ? data.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "يرجى إدخال اسم المستخدم وكلمة المرور." },
      { status: 400 }
    );
  }

  if (!(await verifyCredentials(username, password))) {
    return NextResponse.json(
      { error: "اسم المستخدم أو كلمة المرور غير صحيحة." },
      { status: 401 }
    );
  }

  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieOptions(token));
  return response;
}
