import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import type { ParsedVitaminResult } from "@/lib/reportAnalytics";
import { ProgressBar } from "@/components/results/ProgressBar";

type VitaminCardProps = {
  item: ParsedVitaminResult;
};

function statusIcon(status: "Low" | "Normal" | "High") {
  if (status === "Low") {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  }
  if (status === "High") {
    return <TrendingUp className="h-4 w-4 text-amber-500" />;
  }
  return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
}

function toBulletList(value: string): string[] {
  return value
    .split(/[,;]\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function VitaminCard({ item }: VitaminCardProps) {
  const foods = toBulletList(item.foods);

  return (
    <article className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur p-5 md:p-6 shadow-sm break-inside-avoid print:shadow-none print:border-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{item.vitamin}</h3>
          <p className="text-xs text-muted-foreground mt-1">Confidence: {item.confidence}%</p>
        </div>
        <SeverityBadge severity={item.severity} />
      </div>

      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs">
        {statusIcon(item.statusLabel)}
        <span className="font-medium">Status: {item.statusLabel}</span>
      </div>

      <div className="mt-4">
        <ProgressBar current={item.currentValue} required={item.requiredValue} unit={item.unit} statusLabel={item.statusLabel} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <section className="rounded-lg border border-border/50 bg-background/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Insight</p>
          <p className="mt-1 text-sm leading-relaxed">{item.status}</p>
        </section>
        <section className="rounded-lg border border-border/50 bg-background/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Foods</p>
          {foods.length > 0 ? (
            <ul className="mt-1 list-disc list-inside text-sm space-y-0.5">
              {foods.map((food) => (
                <li key={food}>{food}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm">No food guidance provided.</p>
          )}
        </section>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <section className="rounded-lg border border-border/50 bg-background/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Precaution
          </p>
          <p className="mt-1 text-sm leading-relaxed">{item.precaution}</p>
        </section>
        <section className="rounded-lg border border-border/50 bg-background/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Supplement</p>
          <p className="mt-1 text-sm leading-relaxed">{item.supplement}</p>
        </section>
      </div>
    </article>
  );
}
