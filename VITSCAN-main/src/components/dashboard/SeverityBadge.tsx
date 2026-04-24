import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: "mild" | "moderate" | "severe";
}

const config = {
  mild: { label: "Mild", className: "bg-severity-mild/15 text-severity-mild" },
  moderate: { label: "Moderate", className: "bg-severity-moderate/15 text-severity-moderate" },
  severe: { label: "Severe", className: "bg-severity-severe/15 text-severity-severe" },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const c = config[severity];
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", c.className)}>
      {c.label}
    </span>
  );
}
