import Link from "next/link";
import {
  getAdminStats,
  listAllDecisions,
  listSuggestions,
} from "@/lib/db";
import { formatArabicDate, arabicNumber } from "@/lib/format";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import styles from "./page.module.css";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

export default function AdminDashboard() {
  const stats = getAdminStats();
  const recentDecisions = listAllDecisions().slice(0, 4);
  const recentSuggestions = listSuggestions().slice(0, 5);

  const cards = [
    {
      label: "القرارات المنشورة",
      value: stats.totalDecisions,
      accent: "var(--color-forest)",
    },
    {
      label: "مقترحات قيد المراجعة",
      value: stats.pendingSuggestions,
      accent: "var(--color-golden-wheat)",
    },
    {
      label: "مقترحات مقبولة",
      value: stats.approvedSuggestions,
      accent: "var(--color-mountain-teal)",
    },
  ];

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>لوحة المعلومات</h1>
          <p className={styles.subtitle}>
            نظرة عامة على القرارات والمقترحات الواردة عبر المنصة.
          </p>
        </div>
        <div className={styles.headActions}>
          <Link href="/admin/decisions/new" className="btn btn-primary">
            نشر قرار جديد
          </Link>
          <AdminLogoutButton variant="danger" />
        </div>
      </header>

      <div className={styles.stats}>
        {cards.map((card) => (
          <div
            key={card.label}
            className={styles.statCard}
            style={{ borderTopColor: card.accent }}
          >
            <span className={styles.statValue}>
              {arabicNumber(card.value)}
            </span>
            <span className={styles.statLabel}>{card.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>أحدث القرارات</h2>
            <Link href="/" className={styles.panelLink}>
              عرض الكل
            </Link>
          </div>
          <ul className={styles.list}>
            {recentDecisions.map((d) => (
              <li key={d.id} className={styles.listItem}>
                <Link
                  href={`/decisions/${d.id}`}
                  className={styles.itemTitle}
                >
                  {d.title}
                </Link>
                <div className={styles.itemMeta}>
                  <span className="badge">{d.category}</span>
                  <span>قرار رقم {d.number}</span>
                  <span>{formatArabicDate(d.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>أحدث المقترحات</h2>
            <Link href="/admin/suggestions" className={styles.panelLink}>
              إدارة المقترحات
            </Link>
          </div>
          <ul className={styles.list}>
            {recentSuggestions.map((s) => (
              <li key={s.id} className={styles.listItem}>
                <p className={styles.suggestionBody}>{s.body}</p>
                <div className={styles.itemMeta}>
                  <span
                    className={`${styles.statusTag} ${styles[`status_${s.status}`]}`}
                  >
                    {STATUS_LABELS[s.status]}
                  </span>
                  <span>{s.decisionTitle}</span>
                  <span>{formatArabicDate(s.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
