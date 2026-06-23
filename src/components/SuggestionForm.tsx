"use client";

import { useState } from "react";
import styles from "./SuggestionForm.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function SuggestionForm({
  decisionId,
}: {
  decisionId: string;
}) {
  const [body, setBody] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setState("submitting");
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId, body: body.trim() }),
      });
      if (!res.ok) throw new Error("failed");
      setBody("");
      setState("success");
    } catch {
      setState("error");
    }
  }

  return (
    <section className={styles.wrap} aria-labelledby="suggestion-title">
      <h2 id="suggestion-title" className={styles.title}>
        أضف مقترحك حول هذا القرار
      </h2>
      <p className={styles.hint}>
        ملاحظاتك ومقترحاتك تساهم في تطوير الخدمات. تُراجع جميع المقترحات قبل
        اعتمادها.
      </p>

      {state === "success" ? (
        <div className={styles.success} role="status">
          تم إرسال مقترحك بنجاح. شكراً لمساهمتك؛ سيتم مراجعته من قبل الجهة
          المختصة.
          <button
            type="button"
            className={`btn btn-secondary ${styles.again}`}
            onClick={() => setState("idle")}
          >
            إضافة مقترح آخر
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={onSubmit}>
          <textarea
            className={styles.textarea}
            placeholder="اكتب مقترحك هنا..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            required
            aria-label="نص المقترح"
          />
          {state === "error" && (
            <p className={styles.error} role="alert">
              تعذّر إرسال المقترح. يرجى المحاولة مرة أخرى.
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={state === "submitting" || !body.trim()}
          >
            {state === "submitting" ? "جارٍ الإرسال..." : "إرسال المقترح"}
          </button>
        </form>
      )}
    </section>
  );
}
