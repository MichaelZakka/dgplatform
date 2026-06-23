"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, InboxIcon, PlusIcon } from "./icons";
import AdminLogoutButton from "./AdminLogoutButton";
import styles from "./AdminSidebar.module.css";

const LINKS = [
  { href: "/admin", label: "لوحة المعلومات", icon: GridIcon, exact: true },
  { href: "/admin/decisions/new", label: "نشر قرار جديد", icon: PlusIcon },
  { href: "/admin/suggestions", label: "المقترحات", icon: InboxIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.heading}>
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
      </div>

      <nav className={styles.nav}>
        {LINKS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.link} ${
              isActive(href, exact) ? styles.linkActive : ""
            }`}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>

      <div className={styles.footerActions}>
        <Link href="/" className={styles.exit}>
          العودة إلى الموقع العام
        </Link>
        <AdminLogoutButton variant="danger" className={styles.logout} />
      </div>
    </aside>
  );
}
