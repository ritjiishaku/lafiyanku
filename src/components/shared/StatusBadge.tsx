interface StatusBadgeProps {
  status: "draft" | "finalised" | "archived";
  size?: "sm" | "lg";
}

const statusConfig: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  draft: {
    label: "Draft",
    icon: "\u23F3",
    bg: "#FFF8E1",
    text: "#B45309",
    border: "#D97706",
  },
  finalised: {
    label: "Finalised",
    icon: "\u2713",
    bg: "#E8F5E9",
    text: "#1A7A3C",
    border: "#1A7A3C",
  },
  archived: {
    label: "Archived",
    icon: "\uD83D\uDCC1",
    bg: "#F0F4F8",
    text: "#4B5E73",
    border: "#CBD5E1",
  },
};

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

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const cfg = statusConfig[status];

  if (size === "lg") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 9999,
          border: `1px solid ${cfg.border}`,
          backgroundColor: cfg.bg,
          color: cfg.text,
          padding: "6px 12px",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
