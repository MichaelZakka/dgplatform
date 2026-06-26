"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CloseIcon,
  DocIcon,
  DraftIcon,
  GridIcon,
  InboxIcon,
  PlusIcon,
} from "./icons";
import AdminLogoutButton from "./AdminLogoutButton";
import styles from "./AdminSidebar.module.css";

const LINKS = [
  { href: "/admin", label: "لوحة المعلومات", icon: GridIcon, exact: true },
  { href: "/admin/decisions", label: "إدارة القرارات", icon: DocIcon, exact: true },
  { href: "/admin/drafts", label: "المسودات", icon: DraftIcon, exact: true },
  { href: "/admin/decisions/new", label: "نشر قرار جديد", icon: PlusIcon, exact: true },
  { href: "/admin/suggestions", label: "المقترحات", icon: InboxIcon },
];

interface AdminSidebarProps {
  open?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

export default function AdminSidebar({
  open = false,
  onNavigate,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      id="admin-sidebar"
      className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
      aria-hidden={isMobile && !open ? true : undefined}
    >
      <div className={styles.heading}>
        <Link
          href="/admin"
          className={styles.headingBrand}
          onClick={onNavigate}
          aria-label="العودة إلى لوحة المعلومات"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="شعار الجمهورية العربية السورية"
            className={styles.logo}
            width={44}
            height={44}
          />
          <div>
            <div className={styles.headingMain}>لوحة الإدارة</div>
            <div className={styles.headingSub}>محافظة دمشق</div>
          </div>
        </Link>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="إغلاق القائمة"
        >
          <CloseIcon width={20} height={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        {LINKS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${
              isActive(href, exact) ? styles.linkActive : ""
            }`}
            onClick={onNavigate}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.footerActions}>
        <Link href="/" className={styles.exit} onClick={onNavigate}>
          العودة إلى الموقع العام
        </Link>
        <AdminLogoutButton variant="danger" className={styles.logout} />
      </div>
    </aside>
  );
}
