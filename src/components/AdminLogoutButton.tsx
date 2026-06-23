"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./AdminLogoutButton.module.css";

export default function AdminLogoutButton({
  className = "",
  variant = "secondary",
}: {
  className?: string;
  variant?: "secondary" | "danger";
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const btnClass =
    variant === "danger"
      ? `btn btn-danger ${styles.btn}`
      : `btn btn-secondary ${styles.btn}`;

  return (
    <button
      type="button"
      className={`${btnClass} ${className}`}
      onClick={logout}
      disabled={loggingOut}
    >
      {loggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}
    </button>
  );
}
