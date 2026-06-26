import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`page-container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="الصفحة الرئيسية">
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
      </div>
    </header>
  );
}
