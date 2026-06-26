"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./DeleteDecisionButton.module.css";

export default function DeleteDecisionButton({
  id,
  label = "حذف",
  confirmText = "تأكيد الحذف؟",
  confirmLabel = "نعم، احذف",
  redirectTo,
}: {
  id: string;
  label?: string;
  confirmText?: string;
  confirmLabel?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setBusy(true);
    try {
      await fetch(`/api/decisions/${id}`, { method: "DELETE" });
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className={styles.confirm}>
        <span className={styles.confirmText}>{confirmText}</span>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={busy}
        >
          {busy ? "جارٍ..." : confirmLabel}
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
      {label}
    </button>
  );
}
