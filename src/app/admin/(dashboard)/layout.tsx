import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getSession } from "@/lib/auth";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthed = await getSession();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
