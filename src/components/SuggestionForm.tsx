"use client";

import { useState } from "react";
import styles from "./SuggestionForm.module.css";

const MAX_CHARS = 250;
const ARABIC_ONLY = /^[\u0600-\u06FF\s\u060C\u061B\u061F.,!:()\-«»]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitState = "idle" | "submitting" | "success" | "error";
type CheckState = "idle" | "verifying" | "verified" | "failed";

export default function SuggestionForm({
  decisionId,
}: {
  decisionId: string;
}) {
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [captchaId, setCaptchaId] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const hasNonArabic = body.length > 0 && !ARABIC_ONLY.test(body);
  const charsLeft = MAX_CHARS - body.length;
  const overLimit = body.length > MAX_CHARS;

  async function handleCheck() {
    if (checkState !== "idle" && checkState !== "failed") return;
    setCheckState("verifying");
    try {
      const res = await fetch("/api/captcha");
      const data = await res.json();
      // Animate for 1.2 s so the token ages past the server MIN_AGE_MS
      await new Promise((r) => setTimeout(r, 1200));
      setCaptchaId(data.id);
      setCheckState("verified");
    } catch {
      setCheckState("failed");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_RE.test(email)) {
      setErrorMsg("البريد الإلكتروني غير صالح.");
      setSubmitState("error");
      return;
    }
    if (hasNonArabic) {
      setErrorMsg("يُقبل النص العربي فقط في حقل المقترح.");
      setSubmitState("error");
      return;
    }
    if (overLimit) {
      setErrorMsg(`يجب ألا يتجاوز المقترح ${MAX_CHARS} حرفاً.`);
      setSubmitState("error");
      return;
    }
    if (checkState !== "verified" || !captchaId) {
      setErrorMsg("يرجى إتمام التحقق أولاً.");
      setSubmitState("error");
      return;
    }

    setSubmitState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionId,
          email: email.trim(),
          body: body.trim(),
          captchaId,
          _hp: "", // honeypot — must stay empty
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Reset captcha so user can verify again
        setCheckState("idle");
        setCaptchaId(null);
        setErrorMsg(data.error ?? "تعذّر إرسال المقترح. يرجى المحاولة مرة أخرى.");
        setSubmitState("error");
        return;
      }

      setSubmitState("success");
    } catch {
      setCheckState("idle");
      setCaptchaId(null);
      setErrorMsg("تعذّر إرسال المقترح. يرجى المحاولة مرة أخرى.");
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <section className={styles.wrap} aria-labelledby="suggestion-title">
        <h2 id="suggestion-title" className={styles.title}>
          أضف مقترحك حول هذا القرار
        </h2>
        <div className={styles.success} role="status">
          تم إرسال مقترحك بنجاح. شكراً لمساهمتك؛ سيتم مراجعته من قبل الجهة
          المختصة.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-labelledby="suggestion-title">
      <h2 id="suggestion-title" className={styles.title}>
        أضف مقترحك حول هذا القرار
      </h2>
      <p className={styles.hint}>
        ملاحظاتك ومقترحاتك تساهم في تطوير الخدمات. تُراجع جميع المقترحات قبل
        اعتمادها. يُقبل مقترح واحد فقط لكل بريد إلكتروني لكل قرار.
      </p>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {/* Honeypot — hidden from humans, bots fill it */}
        <input
          type="text"
          name="_hp"
          tabIndex={-1}
          aria-hidden="true"
          className={styles.honeypot}
          autoComplete="off"
        />

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sg-email">
            البريد الإلكتروني <span className={styles.req}>*</span>
          </label>
          <input
            id="sg-email"
            type="email"
            className={styles.input}
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            autoComplete="email"
          />
        </div>

        {/* Body */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="sg-body">
              نص المقترح <span className={styles.req}>*</span>
            </label>
            <span
              className={`${styles.counter} ${
                overLimit
                  ? styles.counterOver
                  : charsLeft <= 30
                  ? styles.counterWarn
                  : ""
              }`}
            >
              {body.length} / {MAX_CHARS}
            </span>
          </div>
          <textarea
            id="sg-body"
            className={`${styles.textarea} ${hasNonArabic ? styles.textareaInvalid : ""}`}
            placeholder="اكتب مقترحك هنا بالعربية..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            required
            maxLength={MAX_CHARS + 50}
            aria-describedby={hasNonArabic ? "sg-body-hint" : undefined}
          />
          {hasNonArabic && (
            <p id="sg-body-hint" className={styles.fieldError} role="alert">
              يُقبل النص العربي فقط. يرجى حذف الأحرف اللاتينية أو الأرقام.
            </p>
          )}
        </div>

        {/* Checkbox CAPTCHA */}
        <div className={styles.captchaBox}>
          <button
            type="button"
            role="checkbox"
            aria-checked={checkState === "verified"}
            className={`${styles.captchaCheck} ${
              checkState === "verified" ? styles.captchaChecked : ""
            } ${checkState === "failed" ? styles.captchaFailed : ""}`}
            onClick={handleCheck}
            disabled={checkState === "verifying" || checkState === "verified"}
            aria-label="التحقق من أنك لست روبوتاً"
          >
            {checkState === "verifying" && (
              <span className={styles.spinner} aria-hidden="true" />
            )}
            {checkState === "verified" && (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <span className={styles.captchaLabel}>
            {checkState === "verifying"
              ? "جارٍ التحقق..."
              : checkState === "verified"
              ? "تم التحقق"
              : checkState === "failed"
              ? "فشل التحقق — حاول مرة أخرى"
              : "لست روبوتاً"}
          </span>

          <div className={styles.captchaBrand} aria-hidden="true">
            <svg viewBox="0 0 64 64" width="32" height="32">
              <circle cx="32" cy="32" r="30" fill="#4A7C7E" opacity="0.15" />
              <path
                d="M32 12 A20 20 0 0 1 52 32"
                stroke="#4A7C7E"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M52 32 A20 20 0 0 1 32 52"
                stroke="#8BA888"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M32 52 A20 20 0 0 1 12 32"
                stroke="#C4A882"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M12 32 A20 20 0 0 1 32 12"
                stroke="#B85C5C"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.captchaBrandText}>التحقق الآمن</span>
          </div>
        </div>

        {submitState === "error" && errorMsg && (
          <p className={styles.error} role="alert">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            submitState === "submitting" ||
            !body.trim() ||
            !email.trim() ||
            hasNonArabic ||
            overLimit ||
            checkState !== "verified"
          }
        >
          {submitState === "submitting" ? "جارٍ الإرسال..." : "إرسال المقترح"}
        </button>
      </form>
    </section>
  );
}
