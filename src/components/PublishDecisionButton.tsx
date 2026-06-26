"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishDecisionButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    setBusy(true);
    try {
      await fetch(`/api/decisions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={handlePublish}
      disabled={busy}
    >
      {busy ? "جارٍ النشر..." : "نشر"}
    </button>
  );
}
