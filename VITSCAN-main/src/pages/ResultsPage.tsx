import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { FileDown, Share2, CalendarCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useAuth } from "@/components/auth/AuthProvider";
import { parseReportOutput } from "@/lib/reportAnalytics";
import { SummaryCard } from "@/components/results/SummaryCard";
import { VitaminCard } from "@/components/results/VitaminCard";

const barColors: Record<string, string> = {
  mild: "hsl(142, 60%, 45%)",
  moderate: "hsl(38, 90%, 55%)",
  severe: "hsl(0, 72%, 55%)",
};

export default function ResultsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [analysisOutput, setAnalysisOutput] = useState("");
  const printableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stateOutput = (location.state as { analysisOutput?: string } | null)
      ?.analysisOutput;
    const storedOutput =
      sessionStorage.getItem("vitscan_analysis_output") ?? "";
    setAnalysisOutput(stateOutput ?? storedOutput);
  }, [location.state]);

  const parsed = useMemo(() => parseReportOutput(analysisOutput, user), [analysisOutput, user]);

  const results = parsed?.results ?? [];
  const overallConfidence = parsed?.overallConfidence ?? 0;
  const biomarkersAnalyzed = parsed?.biomarkersAnalyzed ?? 0;
  const summary = parsed?.summary ?? "";
  const deficiencyCount = results.filter(
    (r) => r.severity === "severe" || r.severity === "moderate",
  ).length;

  const barData = results.map((r) => ({
    name: r.vitamin.replace("Vitamin ", ""),
    required: r.requiredValue,
    current: r.currentValue,
    severity: r.severity,
    statusLabel: r.statusLabel,
  }));

  const downloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFontSize(18);
    doc.text("VITSCAN - Full Analysis Report", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleString()}`, margin, y);
    y += 6;
    doc.text(`Overall Confidence: ${overallConfidence}%  |  Biomarkers: ${biomarkersAnalyzed}  |  Deficiencies: ${deficiencyCount}`, margin, y);
    y += 6;
    const wrappedSummary = doc.splitTextToSize(`Summary: ${summary || "No summary available."}`, maxWidth) as string[];
    for (const row of wrappedSummary) {
      doc.text(row, margin, y);
      y += 4.5;
    }
    y += 4;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    for (const r of results) {
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${r.vitamin}  [${r.severity.toUpperCase()}]  —  ${r.confidence}% confidence`, margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setTextColor(80);
      const details = [
        `Status: ${r.status}`,
        `Foods: ${r.foods}`,
        `Precaution: ${r.precaution}`,
        `Supplement: ${r.supplement}`,
      ];
      for (const line of details) {
        const wrapped = doc.splitTextToSize(line, maxWidth) as string[];
        for (const wl of wrapped) {
          doc.text(wl, margin + 4, y);
          y += 4.5;
        }
      }
      y += 4;
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Disclaimer: This is an AI-generated report and not a medical diagnosis. Consult a healthcare professional.", margin, doc.internal.pageSize.getHeight() - 10);

    doc.save(`vitscan-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <DashboardLayout
      title="AI Results"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}>
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-1 h-4 w-4" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf}>
            <FileDown className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button variant="gradient" size="sm">
            <CalendarCheck className="mr-1 h-4 w-4" /> Book Consultation
          </Button>
        </div>
      }
    >
      <div ref={printableRef} className="mx-auto max-w-6xl space-y-6 print:max-w-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="print:mt-0"
        >
          <SummaryCard
            overallConfidence={overallConfidence}
            biomarkersAnalyzed={biomarkersAnalyzed}
            summary={summary}
          />
        </motion.div>

        {!parsed || results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center"
          >
            <p className="text-2xl font-semibold">No analysis available yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload or capture an image to generate your first AI health report.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border/50 bg-card/80 p-6"
              >
                <h3 className="mb-4 text-lg font-semibold">Required vs Current Values</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="required" fill="hsl(210 30% 82%)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="current" radius={[8, 8, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={barColors[entry.severity]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-border/50 bg-card/80 p-6"
              >
                <h3 className="mb-4 text-lg font-semibold">Report Snapshot</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Deficiencies</p>
                    <p className="mt-1 text-3xl font-bold text-red-500">{deficiencyCount}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Normal</p>
                    <p className="mt-1 text-3xl font-bold text-emerald-500">
                      {results.filter((item) => item.statusLabel === "Normal").length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Biomarkers</p>
                    <p className="mt-1 text-3xl font-bold text-cyan-600">{biomarkersAnalyzed || results.length}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {results.map((item, index) => (
                <motion.div
                  key={`${item.vitamin}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                >
                  <VitaminCard item={item} />
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-3 justify-center print:hidden"
        >
          <Button variant="gradient" size="lg" onClick={downloadPdf}>
            <FileDown className="mr-2 h-4 w-4" /> Download Full Report (PDF)
          </Button>
          <Button variant="glass" size="lg">
            <Share2 className="mr-2 h-4 w-4" /> Share Secure Link
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
