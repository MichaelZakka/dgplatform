"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/types";
import { formatArabicDate } from "@/lib/format";
import styles from "./page.module.css";

interface SuggestionRow {
  id: string;
  decisionId: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decisionTitle: string;
  decisionNumber: string;
  decisionCategory: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

const STATUS_FILTERS = [
  { value: "", label: "كل الحالات" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" },
];

export default function SuggestionsModerationPage() {
  const [rows, setRows] = useState<SuggestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    const res = await fetch(`/api/suggestions?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setRows(data.suggestions ?? []);
    setLoading(false);
  }, [status, category]);

  useEffect(() => {
    // Fetch suggestions whenever the active filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function moderate(id: string, nextStatus: "approved" | "rejected") {
    setBusyId(id);
    await fetch(`/api/suggestions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setBusyId(null);
    load();
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>إدارة المقترحات</h1>
          <p className={styles.subtitle}>
            مراجعة المقترحات الواردة من المواطنين واتخاذ الإجراء المناسب.
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>الحالة</span>
          <div className={styles.chips}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`${styles.chip} ${status === f.value ? styles.chipActive : ""}`}
                onClick={() => setStatus(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>التصنيف</span>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">كل التصنيفات</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المقترح</th>
              <th>القرار المرتبط</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.placeholder}>
                  جارٍ التحميل...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.placeholder}>
                  لا توجد مقترحات مطابقة.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className={styles.bodyCell}>{row.body}</td>
                  <td>
                    <div className={styles.decisionCell}>
                      <span className={styles.decisionTitle}>
                        {row.decisionTitle}
                      </span>
                      <span className={styles.decisionNumber}>
                        قرار رقم {row.decisionNumber}
                      </span>
                    </div>
                  </td>
                  <td className={styles.nowrap}>
                    {formatArabicDate(row.createdAt)}
                  </td>
                  <td>
                    <span
                      className={`${styles.status} ${styles[`status_${row.status}`]}`}
                    >
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={
                          busyId === row.id || row.status === "approved"
                        }
                        onClick={() => moderate(row.id, "approved")}
                      >
                        موافقة
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={
                          busyId === row.id || row.status === "rejected"
                        }
                        onClick={() => moderate(row.id, "rejected")}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
