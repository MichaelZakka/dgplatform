import { notFound } from "next/navigation";
import { getDecision } from "@/lib/db";
import EditDecisionForm from "./EditDecisionForm";

export default async function EditDraftDecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decision = await getDecision(id);

  if (!decision || decision.status !== "draft") {
    notFound();
  }

  return <EditDecisionForm decision={decision} />;
}
