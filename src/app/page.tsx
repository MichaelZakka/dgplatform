import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterBar from "@/components/FilterBar";
import DecisionCard from "@/components/DecisionCard";
import { listDecisions } from "@/lib/db";
import { arabicNumber } from "@/lib/format";
import styles from "./page.module.css";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const decisions = await listDecisions({
    search: getParam("search"),
    category: getParam("category"),
    governorate: getParam("governorate"),
    directorate: getParam("directorate"),
    area: getParam("area"),
    year: getParam("year"),
    month: getParam("month"),
    from: getParam("from"),
  });

  return (
    <>
      <Header />
      <main className={`page-container ${styles.main}`}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>القرارات الرسمية</h1>
          <p className={styles.heroText}>
            تصفّح القرارات الصادرة عن محافظة دمشق، وحمّل نصوصها الرسمية، وشارك
            بمقترحاتك حول ما يهمّ مدينتك.
          </p>
        </section>

        <Suspense fallback={<div className={styles.filterFallback} />}>
          <FilterBar />
        </Suspense>

        <div className={styles.resultMeta}>
          <span>
            عدد القرارات: {arabicNumber(decisions.length)}
          </span>
        </div>

        {decisions.length > 0 ? (
          <div className={styles.grid}>
            {decisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>لا توجد قرارات مطابقة لمعايير البحث الحالية.</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
