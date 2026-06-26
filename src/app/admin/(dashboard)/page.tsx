import Link from "next/link";
import {
  getAdminStats,
  listAllDecisions,
  listDraftDecisions,
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
  const recentDecisions = listAllDecisions()
    .filter((d) => d.status === "published")
    .slice(0, 4);
  const recentDrafts = listDraftDecisions().slice(0, 4);
  const recentSuggestions = listSuggestions().slice(0, 5);

  const cards = [
    {
      label: "القرارات المنشورة",
      value: stats.totalDecisions,
      accent: "var(--color-forest)",
      href: "/admin/decisions",
    },
    {
      label: "المسودات",
      value: stats.totalDrafts,
      accent: "var(--color-golden-wheat)",
      href: "/admin/drafts",
    },
    {
      label: "مقترحات قيد المراجعة",
      value: stats.pendingSuggestions,
      accent: "var(--color-damask-red)",
      href: "/admin/suggestions",
    },
    {
      label: "مقترحات مقبولة",
      value: stats.approvedSuggestions,
      accent: "var(--color-mountain-teal)",
      href: "/admin/suggestions",
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

      {/* Stat cards */}
      <div className={styles.stats}>
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={styles.statCard}
            style={{ borderTopColor: card.accent }}
          >
            <span className={styles.statValue}>
              {arabicNumber(card.value)}
            </span>
            <span className={styles.statLabel}>{card.label}</span>
          </Link>
        ))}
      </div>

      {/* Panels row */}
      <div className={styles.columns}>
        {/* Recent published decisions */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>أحدث القرارات المنشورة</h2>
            <Link href="/admin/decisions" className={styles.panelLink}>
              عرض الكل
            </Link>
          </div>
          <ul className={styles.list}>
            {recentDecisions.length === 0 ? (
              <li className={styles.emptyPanel}>لا توجد قرارات منشورة.</li>
            ) : (
              recentDecisions.map((d) => (
                <li key={d.id} className={styles.listItem}>
                  <Link href={`/admin/decisions/${d.id}`} className={styles.itemTitle}>
                    {d.title}
                  </Link>
                  <div className={styles.itemMeta}>
                    <span className="badge">{d.category}</span>
                    <span>قرار رقم {d.number}</span>
                    <span>{formatArabicDate(d.date)}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Recent drafts */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>أحدث المسودات</h2>
            <Link href="/admin/drafts" className={styles.panelLink}>
              إدارة المسودات
            </Link>
          </div>
          <ul className={styles.list}>
            {recentDrafts.length === 0 ? (
              <li className={styles.emptyPanel}>لا توجد مسودات.</li>
            ) : (
              recentDrafts.map((d) => (
                <li key={d.id} className={styles.listItem}>
                  <span className={styles.itemTitle}>{d.title}</span>
                  <div className={styles.itemMeta}>
                    <span className={styles.draftTag}>مسودة</span>
                    <span>قرار رقم {d.number}</span>
                    <span>{formatArabicDate(d.createdAt)}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* Suggestions panel */}
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>أحدث المقترحات</h2>
          <Link href="/admin/suggestions" className={styles.panelLink}>
            إدارة المقترحات
          </Link>
        </div>
        <ul className={styles.list}>
          {recentSuggestions.length === 0 ? (
            <li className={styles.emptyPanel}>لا توجد مقترحات.</li>
          ) : (
            recentSuggestions.map((s) => (
              <li key={s.id} className={styles.listItem}>
                <p className={styles.suggestionBody}>{s.body}</p>
                <div className={styles.itemMeta}>
                  <span>{s.decisionTitle}</span>
                  <span>{formatArabicDate(s.createdAt)}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
