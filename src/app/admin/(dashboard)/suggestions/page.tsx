"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, type Category } from "@/lib/types";
import { formatArabicDate } from "@/lib/format";
import DeleteSuggestionButton from "@/components/DeleteSuggestionButton";
import styles from "./page.module.css";

interface SuggestionRow {
  id: string;
  decisionId: string;
  email: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  decisionTitle: string;
  decisionNumber: string;
  decisionCategory: string | null;
}

interface DecisionOption {
  id: string;
  title: string;
  number: string;
  category: Category;
}

export default function SuggestionsModerationPage() {
  const [rows, setRows] = useState<SuggestionRow[]>([]);
  const [decisions, setDecisions] = useState<DecisionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionId, setDecisionId] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (decisionId) params.set("decisionId", decisionId);
    if (category) params.set("category", category);
    if (date) params.set("date", date);
    const res = await fetch(`/api/suggestions?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setRows(data.suggestions ?? []);
    setLoading(false);
  }, [decisionId, category, date]);

  useEffect(() => {
    fetch("/api/decisions")
      .then((res) => res.json())
      .then((data) => setDecisions(data.decisions ?? []))
      .catch(() => setDecisions([]));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filteredDecisions = useMemo(() => {
    if (!category) return decisions;
    return decisions.filter((d) => d.category === category);
  }, [decisions, category]);

  useEffect(() => {
    if (!decisionId) return;
    const stillValid = filteredDecisions.some((d) => d.id === decisionId);
    if (!stillValid) setDecisionId("");
  }, [decisionId, filteredDecisions]);

  function clearFilters() {
    setDecisionId("");
    setCategory("");
    setDate("");
  }

  const hasFilters = Boolean(decisionId || category || date);

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>إدارة المقترحات</h1>
          <p className={styles.subtitle}>
            تصفّح المقترحات حسب القرار والتصنيف وتاريخ الإرسال.
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-decision">
            القرار
          </label>
          <select
            id="filter-decision"
            className={styles.select}
            value={decisionId}
            onChange={(e) => setDecisionId(e.target.value)}
          >
            <option value="">كل القرارات</option>
            {filteredDecisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} — قرار {d.number}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-category">
            التصنيف
          </label>
          <select
            id="filter-category"
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

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-date">
            تاريخ الإرسال
          </label>
          <input
            id="filter-date"
            type="date"
            className={styles.dateInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            dir="ltr"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            className={`btn btn-secondary ${styles.clearBtn}`}
            onClick={clearFilters}
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المقترح</th>
              <th>المرسِل</th>
              <th>القرار المرتبط</th>
              <th>تاريخ الإرسال</th>
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
                    {row.email ? (
                      <a
                        href={`mailto:${row.email}`}
                        className={styles.emailLink}
                        dir="ltr"
                      >
                        {row.email}
                      </a>
                    ) : (
                      <span className={styles.missingValue}>—</span>
                    )}
                  </td>
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
                  <td className={styles.dateCell}>
                    <time className={styles.nowrap} dateTime={row.createdAt}>
                      {formatArabicDate(row.createdAt)}
                    </time>
                  </td>
                  <td>
                    <DeleteSuggestionButton id={row.id} onDeleted={load} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className={styles.cardList} aria-label="قائمة المقترحات">
        {loading ? (
          <li className={styles.cardEmpty}>جارٍ التحميل...</li>
        ) : rows.length === 0 ? (
          <li className={styles.cardEmpty}>لا توجد مقترحات مطابقة.</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className={styles.card}>
              <p className={styles.cardBody}>{row.body}</p>
              <div className={styles.cardField}>
                <span className={styles.cardLabel}>القرار المرتبط</span>
                <div className={styles.decisionCell}>
                  <span className={styles.decisionTitle}>
                    {row.decisionTitle}
                  </span>
                  <span className={styles.decisionNumber}>
                    قرار رقم {row.decisionNumber}
                  </span>
                </div>
              </div>
              <div className={styles.cardRow}>
                <div className={styles.cardField}>
                  <span className={styles.cardLabel}>المرسِل</span>
                  {row.email ? (
                    <a
                      href={`mailto:${row.email}`}
                      className={styles.emailLink}
                      dir="ltr"
                    >
                      {row.email}
                    </a>
                  ) : (
                    <span className={styles.missingValue}>—</span>
                  )}
                </div>
                <div className={styles.cardField}>
                  <span className={styles.cardLabel}>تاريخ الإرسال</span>
                  <time dateTime={row.createdAt}>
                    {formatArabicDate(row.createdAt)}
                  </time>
                </div>
              </div>
              <div className={styles.cardActions}>
                <DeleteSuggestionButton id={row.id} onDeleted={load} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
