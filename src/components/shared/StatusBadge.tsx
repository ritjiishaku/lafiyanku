interface StatusBadgeProps {
  status: "draft" | "finalised" | "archived";
}

const statusStyles: Record<string, string> = {
  draft: "bg-warm-amber/10 text-warm-amber border-warm-amber/20",
  finalised: "bg-clinical-teal/10 text-clinical-teal border-clinical-teal/20",
  archived: "bg-cool-grey/10 text-cool-grey border-cool-grey/20",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  finalised: "Finalised",
  archived: "Archived",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
