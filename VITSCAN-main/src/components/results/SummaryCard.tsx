type SummaryCardProps = {
  overallConfidence: number;
  biomarkersAnalyzed: number;
  summary?: string;
};

export function SummaryCard({ overallConfidence, biomarkersAnalyzed, summary = "" }: SummaryCardProps) {
  return (
    <section className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur p-6 md:p-8 shadow-sm print:shadow-none print:border-border">
      <p className="text-xs uppercase tracking-wider text-muted-foreground text-center">Overall AI Confidence</p>
      <p className="mt-1 text-center text-5xl md:text-6xl font-bold text-cyan-600">{overallConfidence}%</p>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground text-center md:grid-cols-2 md:text-left">
        <p>
          Biomarkers analyzed: <span className="font-semibold text-foreground">{biomarkersAnalyzed}</span>
        </p>
        <p>
          Report type: <span className="font-semibold text-foreground">AI Nutrition Scan</span>
        </p>
      </div>
      {summary ? (
        <p className="mt-4 text-sm leading-relaxed text-foreground/90 rounded-xl bg-background/70 border border-border/50 p-4">{summary}</p>
      ) : null}
    </section>
  );
}
