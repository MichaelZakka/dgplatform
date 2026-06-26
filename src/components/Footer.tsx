import { arabicNumber } from "@/lib/format";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = arabicNumber(new Date().getFullYear());

  return (
    <footer className={styles.footer}>
      <div className={`page-container ${styles.top}`}>
        <div className={styles.brandCol}>
          <div className={styles.brandRow}>
            {/* Syrian Arab Republic eagle emblem */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="شعار الجمهورية العربية السورية"
              className={styles.logo}
              width={44}
              height={44}
            />
            <div>
              <div className={styles.brandMain}>منصة القرارات الرقمية</div>
              <div className={styles.brandSub}>محافظة دمشق</div>
            </div>
          </div>
          <p className={styles.about}>
            المنصة الرسمية لنشر قرارات محافظة دمشق واستقبال مقترحات المواطنين،
            تعزيزاً للشفافية والمشاركة المجتمعية في صناعة القرار.
          </p>
        </div>

        <div className={styles.col}>
          <h2 className={styles.colTitle}>تواصل معنا</h2>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactLabel}>العنوان</span>
              <span>دمشق، مبنى المحافظة، ساحة المرجة</span>
            </li>
            <li>
              <span className={styles.contactLabel}>الهاتف</span>
              <span dir="ltr">+963 11 000 0000</span>
            </li>
            <li>
              <span className={styles.contactLabel}>البريد الإلكتروني</span>
              <span dir="ltr">info@damascus.gov.sy</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bar}>
        <div className={`page-container ${styles.barInner}`}>
          <span>
            © {year} محافظة دمشق — الجمهورية العربية السورية. جميع الحقوق
            محفوظة.
          </span>
          <span className={styles.barNote}>منصة القرارات الرقمية</span>
        </div>
      </div>
    </footer>
  );
}
