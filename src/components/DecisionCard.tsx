import Link from "next/link";
import type { Decision } from "@/lib/types";
import { formatArabicDate } from "@/lib/format";
import { DownloadIcon, ArrowIcon } from "./icons";
import styles from "./DecisionCard.module.css";

export default function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.badge}>{decision.category}</span>
        <div className={styles.meta}>
          <span className={styles.number}>قرار رقم {decision.number}</span>
          <time className={styles.date} dateTime={decision.date}>
            {formatArabicDate(decision.date)}
          </time>
        </div>
      </div>

      <h2 className={styles.title}>
        <Link href={`/decisions/${decision.id}`}>{decision.title}</Link>
      </h2>

      <p className={styles.location}>
        {[decision.governorate, decision.directorate, decision.area]
          .filter(Boolean)
          .join(" — ")}
      </p>

      <p className={styles.summary}>{decision.summary}</p>

      <div className={styles.actions}>
        <Link
          href={`/decisions/${decision.id}`}
          className={`btn btn-primary ${styles.action}`}
        >
          <ArrowIcon />
          قراءة المزيد
        </Link>
        <a
          href={decision.pdfUrl || "#"}
          className={`btn btn-secondary ${styles.action}`}
          download
        >
          <DownloadIcon />
          تحميل PDF
        </a>
      </div>
    </article>
  );
}
