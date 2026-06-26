import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthed = await getSession();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
