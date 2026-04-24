import { cn } from "@/lib/utils";

type ProgressBarProps = {
  current: number;
  required: number;
  label?: string;
  unit?: string;
  statusLabel?: "Low" | "Normal" | "High";
};

function getStatusTone(statusLabel?: "Low" | "Normal" | "High"): string {
  if (statusLabel === "Low") {
    return "bg-red-500";
  }
  if (statusLabel === "High") {
    return "bg-amber-500";
  }
  return "bg-emerald-500";
}

export function ProgressBar({ current, required, label = "Current vs Required", unit = "", statusLabel = "Normal" }: ProgressBarProps) {
  const safeRequired = Number.isFinite(required) && required > 0 ? required : 1;
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const ratio = safeCurrent / safeRequired;
  const width = Math.max(0, Math.min(100, ratio * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {safeCurrent} / {safeRequired} {unit}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", getStatusTone(statusLabel))} style={{ width: `${width}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{Math.round(width)}% of required value</p>
    </div>
  );
}
