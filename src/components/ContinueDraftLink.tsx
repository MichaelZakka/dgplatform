import Link from "next/link";

export default function ContinueDraftLink({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <Link
      href={`/admin/decisions/${id}/edit`}
      className={className ?? "btn btn-primary"}
    >
      متابعة القرار
    </Link>
  );
}
