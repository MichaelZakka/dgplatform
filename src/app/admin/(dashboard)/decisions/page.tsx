import Link from "next/link";
import { listAllDecisions } from "@/lib/db";
import { formatArabicDate } from "@/lib/format";
import DeleteDecisionButton from "@/components/DeleteDecisionButton";
import styles from "./page.module.css";

const STATUS_LABELS: Record<string, string> = {
  published: "منشور",
  draft: "مسودة",
};

export default async function AdminDecisionsPage() {
  const decisions = await listAllDecisions();

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>إدارة القرارات</h1>
          <p className={styles.subtitle}>
            عرض جميع القرارات المنشورة والمسودات وحذفها.
          </p>
        </div>
        <Link href="/admin/decisions/new" className="btn btn-primary">
          نشر قرار جديد
        </Link>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>رقم القرار</th>
              <th>العنوان</th>
              <th>التصنيف</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {decisions.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.placeholder}>
                  لا توجد قرارات.
                </td>
              </tr>
            ) : (
              decisions.map((d) => (
                <tr key={d.id}>
                  <td className={styles.nowrap}>{d.number}</td>
                  <td>
                    <Link
                      href={`/admin/decisions/${d.id}`}
                      className={styles.titleLink}
                    >
                      {d.title}
                    </Link>
                  </td>
                  <td>{d.category}</td>
                  <td className={styles.nowrap}>{formatArabicDate(d.date)}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[`status_${d.status}`]
                      }`}
                    >
                      {STATUS_LABELS[d.status]}
                    </span>
                  </td>
                  <td>
                    <DeleteDecisionButton id={d.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className={styles.cardList} aria-label="قائمة القرارات">
        {decisions.length === 0 ? (
          <li className={styles.cardEmpty}>لا توجد قرارات.</li>
        ) : (
          decisions.map((d) => (
            <li key={d.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardNumber}>قرار رقم {d.number}</span>
                <span
                  className={`${styles.status} ${
                    styles[`status_${d.status}`]
                  }`}
                >
                  {STATUS_LABELS[d.status]}
                </span>
              </div>
              <Link
                href={`/admin/decisions/${d.id}`}
                className={styles.cardTitle}
              >
                {d.title}
              </Link>
              <div className={styles.cardMeta}>
                <span>{d.category}</span>
                <time dateTime={d.date}>{formatArabicDate(d.date)}</time>
              </div>
              <div className={styles.cardActions}>
                <DeleteDecisionButton id={d.id} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
