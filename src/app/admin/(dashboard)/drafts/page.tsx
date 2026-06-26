import Link from "next/link";
import { listDraftDecisions } from "@/lib/db";
import { formatArabicDate } from "@/lib/format";
import ContinueDraftLink from "@/components/ContinueDraftLink";
import DeleteDecisionButton from "@/components/DeleteDecisionButton";
import styles from "./page.module.css";

export default function AdminDraftsPage() {
  const drafts = listDraftDecisions();

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>المسودات</h1>
          <p className={styles.subtitle}>
            القرارات المحفوظة كمسودات. يمكنك متابعة إكمالها أو إزالتها.
          </p>
        </div>
        <Link href="/admin/decisions/new" className="btn btn-primary">
          قرار جديد
        </Link>
      </header>

      {drafts.length === 0 ? (
        <div className={styles.empty}>
          <p>لا توجد مسودات حالياً.</p>
          <Link href="/admin/decisions/new" className="btn btn-secondary">
            إنشاء قرار جديد
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>رقم القرار</th>
                  <th>العنوان</th>
                  <th>التصنيف</th>
                  <th>تاريخ الإنشاء</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((d) => (
                  <tr key={d.id}>
                    <td className={styles.nowrap}>{d.number}</td>
                    <td>
                      <span className={styles.draftTitle}>{d.title}</span>
                      <span className={styles.draftBadge}>مسودة</span>
                    </td>
                    <td>{d.category}</td>
                    <td className={styles.nowrap}>
                      {formatArabicDate(d.createdAt)}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <ContinueDraftLink id={d.id} />
                        <DeleteDecisionButton
                          id={d.id}
                          label="إزالة"
                          confirmText="تأكيد الإزالة؟"
                          confirmLabel="نعم، أزِل"
                          redirectTo="/admin/drafts"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className={styles.cardList} aria-label="قائمة المسودات">
            {drafts.map((d) => (
              <li key={d.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.cardNumber}>قرار رقم {d.number}</span>
                  <span className={styles.draftBadge}>مسودة</span>
                </div>
                <p className={styles.draftTitle}>{d.title}</p>
                <div className={styles.cardMeta}>
                  <span>{d.category}</span>
                  <time dateTime={d.createdAt}>
                    {formatArabicDate(d.createdAt)}
                  </time>
                </div>
                <div className={styles.cardActions}>
                  <ContinueDraftLink id={d.id} />
                  <DeleteDecisionButton
                    id={d.id}
                    label="إزالة"
                    confirmText="تأكيد الإزالة؟"
                    confirmLabel="نعم، أزِل"
                    redirectTo="/admin/drafts"
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
