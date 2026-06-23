"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "القرارات", matches: ["/", "/decisions"] },
  { href: "/admin", label: "لوحة الإدارة", matches: ["/admin"] },
];

export default function Header() {
  const pathname = usePathname();

  function isActive(link: (typeof NAV_LINKS)[number]) {
    return link.matches.some((m) =>
      m === "/" ? pathname === "/" : pathname.startsWith(m)
    );
  }

  return (
    <header className={styles.header}>
      <div className={`page-container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          {/* Syrian Arab Republic eagle emblem */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="شعار الجمهورية العربية السورية"
            className={styles.logo}
            width={48}
            height={48}
          />
          <span className={styles.titles}>
            <span className={styles.titleMain}>منصة القرارات الرقمية</span>
            <span className={styles.titleSub}>محافظة دمشق</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="التنقل الرئيسي">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${styles.navLink} ${
                isActive(link) ? styles.navLinkActive : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
