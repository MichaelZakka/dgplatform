import { notFound } from "next/navigation";
import Link from "next/link";
import { getDecision, getSuggestionsForDecision } from "@/lib/db";
import { formatArabicDate } from "@/lib/format";
import { DownloadIcon, ArrowIcon } from "@/components/icons";
import DeleteDecisionButton from "@/components/DeleteDecisionButton";
import ContinueDraftLink from "@/components/ContinueDraftLink";
import styles from "./page.module.css";

export default async function AdminDecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decision = getDecision(id);

  if (!decision) notFound();

  const suggestions = getSuggestionsForDecision(id);
  const paragraphs = decision.fullText
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={styles.wrap}>
      {/* Back + actions bar */}
      <div className={styles.topBar}>
        <Link href="/admin" className={styles.back}>
          <ArrowIcon />
          العودة إلى لوحة المعلومات
        </Link>
        <div className={styles.topActions}>
          {decision.status === "draft" ? (
            <>
              <ContinueDraftLink id={decision.id} />
              <DeleteDecisionButton
                id={decision.id}
                label="إزالة"
                confirmText="تأكيد الإزالة؟"
                confirmLabel="نعم، أزِل"
                redirectTo="/admin/drafts"
              />
            </>
          ) : (
            <DeleteDecisionButton id={decision.id} />
          )}
        </div>
      </div>

      {/* Decision card */}
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.headerStart}>
            <span className={styles.badge}>{decision.category}</span>
            <span
              className={`${styles.statusBadge} ${styles[`status_${decision.status}`]}`}
            >
              {decision.status === "published" ? "منشور" : "مسودة"}
            </span>
          </div>
          <div className={styles.meta}>
            <span className={styles.number}>قرار رقم {decision.number}</span>
            <time className={styles.date} dateTime={decision.date}>
              {formatArabicDate(decision.date)}
            </time>
          </div>
        </header>

        <h1 className={styles.title}>{decision.title}</h1>

        {decision.governorate && (
          <p className={styles.location}>
            {[decision.governorate, decision.directorate, decision.area]
              .filter(Boolean)
              .join(" — ")}
          </p>
        )}

        {decision.summary && (
          <p className={styles.summary}>{decision.summary}</p>
        )}

        {decision.pdfUrl && (
          <a
            href={`/api/decisions/${decision.id}/pdf`}
            className={`btn btn-primary ${styles.download}`}
            download={`decision-${decision.number.replace(/\//g, "-")}.pdf`}
          >
            <DownloadIcon />
            تحميل القرار بصيغة PDF
          </a>
        )}

        {paragraphs.length > 0 && (
          <>
            <div className={styles.divider} />
            <div className={styles.body}>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </>
        )}
      </article>

      {/* Suggestions section */}
      <section className={styles.suggestionsPanel}>
        <header className={styles.suggestionsHead}>
          <h2 className={styles.suggestionsTitle}>مقترحات المواطنين</h2>
          <span className={styles.suggestionsCount}>{suggestions.length}</span>
        </header>

        {suggestions.length === 0 ? (
          <p className={styles.noSuggestions}>لا توجد مقترحات لهذا القرار بعد.</p>
        ) : (
          <ul className={styles.suggestionsList}>
            {suggestions.map((s) => (
              <li key={s.id} className={styles.suggestionCard}>
                <p className={styles.suggestionBody}>{s.body}</p>
                <footer className={styles.suggestionMeta}>
                  <time dateTime={s.createdAt}>
                    {formatArabicDate(s.createdAt)}
                  </time>
                  {s.email ? (
                    <a
                      href={`mailto:${s.email}`}
                      className={styles.emailLink}
                      dir="ltr"
                    >
                      {s.email}
                    </a>
                  ) : (
                    <span className={styles.anonymousSender}>مرسِل مجهول</span>
                  )}
                </footer>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
