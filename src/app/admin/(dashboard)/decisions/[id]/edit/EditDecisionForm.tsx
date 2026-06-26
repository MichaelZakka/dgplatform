"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, type Category, type Decision } from "@/lib/types";
import {
  GOVERNORATE_NAMES,
  getDirectorates,
  getAreas,
} from "@/lib/locations";
import styles from "../../new/page.module.css";

type FormState = "idle" | "submitting" | "error";

export default function EditDecisionForm({ decision }: { decision: Decision }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfUrl] = useState(decision.pdfUrl);

  const [form, setForm] = useState({
    number: decision.number,
    title: decision.title,
    summary: decision.summary,
    fullText: decision.fullText,
    category: decision.category as Category | "",
    governorate: decision.governorate,
    directorate: decision.directorate,
    area: decision.area,
    date: decision.date,
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onGovernorate(value: string) {
    setForm((prev) => ({
      ...prev,
      governorate: value,
      directorate: "",
      area: "",
    }));
  }

  function onDirectorate(value: string) {
    setForm((prev) => ({ ...prev, directorate: value, area: "" }));
  }

  const directorates = form.governorate
    ? getDirectorates(form.governorate)
    : [];
  const areas =
    form.governorate && form.directorate
      ? getAreas(form.governorate, form.directorate)
      : [];

  async function submit(status: "draft" | "published") {
    if (!form.title.trim()) {
      setState("error");
      setErrorMsg("يرجى إدخال عنوان القرار على الأقل.");
      return;
    }

    if (status === "published") {
      if (
        !form.summary.trim() ||
        !form.fullText.trim() ||
        !form.category ||
        !form.governorate ||
        !form.date
      ) {
        setState("error");
        setErrorMsg("يرجى تعبئة جميع الحقول المطلوبة قبل النشر.");
        return;
      }
    }

    setState("submitting");
    setErrorMsg("");
    try {
      let pdfUrl = existingPdfUrl;
      if (pdfFile) {
        const fd = new FormData();
        fd.append("file", pdfFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadData.error || "تعذّر رفع ملف PDF.");
        }
        const uploadData = await uploadRes.json();
        pdfUrl = uploadData.pdfUrl ?? "";
      }

      const res = await fetch(`/api/decisions/${decision.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status, pdfUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "تعذّر حفظ القرار.");
      }

      router.push(status === "published" ? "/admin/decisions" : "/admin/drafts");
      router.refresh();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>متابعة القرار</h1>
        <p className={styles.subtitle}>
          أكمل بيانات المسودة ثم انشرها أو احفظها للمتابعة لاحقاً.
        </p>
      </header>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          submit("published");
        }}
      >
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="number">
              رقم القرار
            </label>
            <input
              id="number"
              className={styles.input}
              value={form.number}
              onChange={(e) => update("number", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="date">
              تاريخ القرار <span className={styles.req}>*</span>
            </label>
            <input
              id="date"
              type="date"
              className={styles.input}
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              dir="ltr"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            عنوان القرار <span className={styles.req}>*</span>
          </label>
          <input
            id="title"
            className={styles.input}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="عنوان واضح وموجز للقرار"
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="category">
              التصنيف <span className={styles.req}>*</span>
            </label>
            <select
              id="category"
              className={styles.input}
              value={form.category}
              onChange={(e) =>
                update("category", e.target.value as Category)
              }
              required
            >
              <option value="" disabled>
                اختر التصنيف
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="pdf">
              ملف القرار (PDF)
            </label>
            <input
              id="pdf"
              type="file"
              accept=".pdf"
              className={styles.file}
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
            {pdfFile ? (
              <span className={styles.fileName}>{pdfFile.name}</span>
            ) : existingPdfUrl ? (
              <span className={styles.fileName}>ملف PDF مرفق مسبقاً</span>
            ) : null}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="governorate">
              المحافظة <span className={styles.req}>*</span>
            </label>
            <select
              id="governorate"
              className={styles.input}
              value={form.governorate}
              onChange={(e) => onGovernorate(e.target.value)}
              required
            >
              <option value="" disabled>
                اختر المحافظة
              </option>
              {GOVERNORATE_NAMES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="directorate">
              المديرية
            </label>
            <select
              id="directorate"
              className={styles.input}
              value={form.directorate}
              onChange={(e) => onDirectorate(e.target.value)}
              disabled={!form.governorate}
            >
              <option value="">اختر المديرية</option>
              {directorates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="area">
            الناحية / المنطقة
          </label>
          <select
            id="area"
            className={styles.input}
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
            disabled={!form.directorate}
          >
            <option value="">اختر الناحية/المنطقة</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="summary">
            الخلاصة <span className={styles.req}>*</span>
          </label>
          <textarea
            id="summary"
            className={styles.textarea}
            rows={3}
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
            placeholder="ملخّص من سطرين إلى ثلاثة أسطر يظهر في بطاقة القرار"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="fullText">
            النص الكامل <span className={styles.req}>*</span>
          </label>
          <textarea
            id="fullText"
            className={`${styles.textarea} ${styles.fullText}`}
            rows={10}
            value={form.fullText}
            onChange={(e) => update("fullText", e.target.value)}
            placeholder="النص الرسمي الكامل للقرار. استخدم أسطراً جديدة للفصل بين الفقرات."
            required
          />
        </div>

        {state === "error" && (
          <p className={styles.error} role="alert">
            {errorMsg}
          </p>
        )}

        <p className={styles.draftHint}>
          حفظ المسودة يتطلب العنوان فقط — يمكنك إكمال بقية الحقول لاحقاً قبل النشر.
        </p>

        <div className={styles.actions}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={state === "submitting"}
          >
            {state === "submitting" ? "جارٍ الحفظ..." : "نشر القرار"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={state === "submitting"}
            onClick={() => submit("draft")}
          >
            حفظ كمسودة
          </button>
        </div>
      </form>
    </div>
  );
}
