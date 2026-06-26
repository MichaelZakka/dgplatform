import Link from "next/link";
import type { Decision } from "@/lib/types";
import { formatArabicDate } from "@/lib/format";
import { DownloadIcon, ArrowIcon } from "./icons";
import SuggestionForm from "./SuggestionForm";
import styles from "./DecisionDetail.module.css";

export default function DecisionDetail({ decision }: { decision: Decision }) {
  const paragraphs = decision.fullText
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={styles.wrap}>
      <Link href="/" className={styles.back}>
        <ArrowIcon />
        العودة إلى القرارات
      </Link>

      <article className={styles.card}>
        <header className={styles.header}>
          <span className={styles.badge}>{decision.category}</span>
          <div className={styles.meta}>
            <span className={styles.number}>قرار رقم {decision.number}</span>
            <time className={styles.date} dateTime={decision.date}>
              {formatArabicDate(decision.date)}
            </time>
          </div>
        </header>

        <h1 className={styles.title}>{decision.title}</h1>

        <p className={styles.location}>
          {[decision.governorate, decision.directorate, decision.area]
            .filter(Boolean)
            .join(" — ")}
        </p>

        <p className={styles.summary}>{decision.summary}</p>

        <a
          href={`/api/decisions/${decision.id}/pdf`}
          className={`btn btn-primary ${styles.download}`}
          download={`decision-${decision.number.replace(/\//g, "-")}.pdf`}
        >
          <DownloadIcon />
          تحميل القرار بصيغة PDF
        </a>

        <div className={styles.divider} />

        <div className={styles.body}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>

      <SuggestionForm decisionId={decision.id} />
    </div>
  );
}
