"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { MenuIcon } from "./icons";
import styles from "./AdminShell.module.css";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div className={styles.shell}>
      <AdminSidebar open={open} onNavigate={close} onClose={close} />

      {open && (
        <button
          type="button"
          className={styles.backdrop}
          onClick={close}
          aria-label="إغلاق القائمة"
        />
      )}

      <div className={styles.main}>
        <header className={styles.mobileBar}>
          <Link
            href="/admin"
            className={styles.mobileBrand}
            onClick={close}
            aria-label="العودة إلى لوحة المعلومات"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="شعار الجمهورية العربية السورية"
              className={styles.mobileLogo}
              width={40}
              height={40}
            />
            <span className={styles.mobileTitles}>
              <span className={styles.mobileTitleMain}>لوحة الإدارة</span>
              <span className={styles.mobileTitleSub}>محافظة دمشق</span>
            </span>
          </Link>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            <MenuIcon />
            القائمة
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
