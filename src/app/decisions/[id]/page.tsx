import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DecisionDetail from "@/components/DecisionDetail";
import { getDecision } from "@/lib/db";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const decision = await getDecision(id);
  if (!decision) {
    return { title: "القرار غير موجود | محافظة دمشق" };
  }
  return {
    title: `${decision.title} | محافظة دمشق`,
    description: decision.summary,
  };
}

export default async function DecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decision = await getDecision(id);

  if (!decision || decision.status !== "published") {
    notFound();
  }

  return (
    <>
      <Header />
      <main className={`page-container ${styles.main}`}>
        <DecisionDetail decision={decision} />
      </main>
      <Footer />
    </>
  );
}
