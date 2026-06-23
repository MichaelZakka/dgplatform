import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className={`page-container ${styles.main}`}>
        <div className={styles.box}>
          <h1 className={styles.title}>الصفحة غير موجودة</h1>
          <p className={styles.text}>
            عذراً، الصفحة أو القرار الذي تبحث عنه غير متوفر.
          </p>
          <Link href="/" className="btn btn-primary">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
