"use client";

import { useState } from "react";
import styles from "./DeleteDecisionButton.module.css";

export default function DeleteSuggestionButton({
  id,
  onDeleted,
}: {
  id: string;
  onDeleted?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
      if (res.ok) onDeleted?.();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className={styles.confirm}>
        <span className={styles.confirmText}>تأكيد الحذف؟</span>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={busy}
        >
          {busy ? "جارٍ..." : "نعم، احذف"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setConfirming(false)}
          disabled={busy}
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-danger"
      onClick={() => setConfirming(true)}
    >
      حذف
    </button>
  );
}
