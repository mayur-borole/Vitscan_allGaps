import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { FileDown, Calendar, Activity, Loader2, Rocket, Sparkles, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { deleteReport, getReports, updateReportPrompt, type Report } from "@/components/services/aiApi";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsPDF } from "jspdf";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";
import { parseReportOutput } from "@/lib/reportAnalytics";

function downloadPdf(report: Report) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFontSize(18);
  doc.text("VITSCAN - Analysis Report", margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date: ${new Date(report.date).toLocaleString()}`, margin, y);
  y += 6;
  doc.text(`Files Analyzed: ${report.files.join(", ")}`, margin, y);
  y += 6;
  if (report.prompt) {
    doc.text(`Prompt: ${report.prompt}`, margin, y);
    y += 6;
  }
  y += 4;

  // Try to parse structured JSON
  let parsed = null;
  try {
    const cleaned = report.output.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const d = JSON.parse(cleaned);
    if (d.results && Array.isArray(d.results)) parsed = d;
  } catch { /* not JSON */ }

  if (parsed) {
    doc.text(`Overall Confidence: ${parsed.overall_confidence}%  |  Biomarkers: ${parsed.biomarkers_analyzed}`, margin, y);
    y += 6;
    const summaryLines = doc.splitTextToSize(`Summary: ${parsed.summary}`, maxWidth) as string[];
    for (const sl of summaryLines) { doc.text(sl, margin, y); y += 5; }
    y += 4;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    for (const r of parsed.results as { vitamin: string; severity: string; confidence: number; status: string; foods: string; precaution: string; supplement: string }[]) {
      if (y > doc.internal.pageSize.getHeight() - 45) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${r.vitamin}  [${r.severity.toUpperCase()}]  -  ${r.confidence}% confidence`, margin, y);
      y += 7;

      doc.setFontSize(9);
      doc.setTextColor(80);
      const details = [
        `Status: ${r.status}`,
        `Foods: ${r.foods}`,
        `Precaution: ${r.precaution}`,
        `Supplement: ${r.supplement}`,
      ];
      for (const line of details) {
        const wrapped = doc.splitTextToSize(line, maxWidth - 8) as string[];
        for (const wl of wrapped) { doc.text(wl, margin + 4, y); y += 4.5; }
      }
      y += 5;
    }
  } else {
    // Fallback: plain text
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(report.output, maxWidth) as string[];
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 5;
    }
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Disclaimer: This is an AI-generated report and not a medical diagnosis. Consult a healthcare professional.", margin, doc.internal.pageSize.getHeight() - 10);

  doc.save(`vitscan-report-${new Date(report.date).toISOString().slice(0, 10)}.pdf`);
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getReports();
      setReports(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const onDeleteReport = async (reportId: string) => {
    const ok = window.confirm("Delete this report? This action cannot be undone.");
    if (!ok) {
      return;
    }

    try {
      await deleteReport(reportId);
      setReports((prev) => prev.filter((row) => row.id !== reportId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete report.");
    }
  };

  const onEditPrompt = async (report: Report) => {
    const nextPrompt = window.prompt("Edit saved prompt for this report:", report.prompt ?? "");
    if (nextPrompt === null) {
      return;
    }

    try {
      const updated = await updateReportPrompt(report.id, nextPrompt.trim() || null);
      setReports((prev) => prev.map((row) => (row.id === report.id ? { ...row, prompt: updated.prompt } : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report.");
    }
  };

  const analytics = reports
    .slice()
    .reverse()
    .map((report) => {
      const parsed = parseReportOutput(report.output, user);
      const confidence = parsed?.overallConfidence ?? 0;
      const severe = parsed?.results.filter((item) => item.statusLabel === "Low").length ?? 0;
      const moderate = parsed?.results.filter((item) => item.statusLabel === "Normal").length ?? 0;
      const mild = parsed?.results.filter((item) => item.statusLabel === "High").length ?? 0;

      return {
        id: report.id,
        dateLabel: new Date(report.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        severe,
        moderate,
        mild,
        confidence,
      };
    });

  const latestComparison = reports[0]
    ? parseReportOutput(reports[0].output, user)?.results.map((item) => ({
        vitamin: item.vitamin.replace("Vitamin ", ""),
        Required: item.requiredValue,
        Current: item.currentValue,
      })) ?? []
    : [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-border/50 px-4 glass-card">
            <SidebarTrigger />
            <h1 className="text-lg font-bold ml-3">My Reports</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto space-y-4">
              {loading && (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {error && (
                <div className="glass-card rounded-2xl p-6 text-center text-destructive">
                  {error}
                </div>
              )}

              {!loading && !error && reports.length === 0 && (
                <div className="glass-card rounded-3xl p-10 text-center border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
                  <div className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4">
                    <Rocket className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold mb-2">No reports yet 🚀</p>
                  <p className="text-muted-foreground mb-5">
                    Start your first scan to unlock personalized deficiency analytics and trends.
                  </p>
                  <Button variant="gradient" asChild>
                    <Link to="/upload">
                      <Sparkles className="mr-2 h-4 w-4" /> Upload or Capture Images
                    </Link>
                  </Button>
                </div>
              )}

              {!loading && !error && reports.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Confidence Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="confidence" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="font-semibold mb-4">Latest Required vs Current</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={latestComparison}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                        <XAxis dataKey="vitamin" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="Required" fill="hsl(210 30% 82%)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Current" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {reports.map((r, i) => {
                const reportNum = String(reports.length - i).padStart(2, "0");
                let summary = "";
                let lowCount = 0;
                let normalCount = 0;
                let highCount = 0;
                try {
                  const parsed = parseReportOutput(r.output, user);
                  if (parsed?.summary) summary = parsed.summary;
                  lowCount = parsed?.results.filter((item) => item.statusLabel === "Low").length ?? 0;
                  normalCount = parsed?.results.filter((item) => item.statusLabel === "Normal").length ?? 0;
                  highCount = parsed?.results.filter((item) => item.statusLabel === "High").length ?? 0;
                } catch { /* not JSON */ }
                if (!summary) {
                  const plain = r.output.replace(/[{}[\]"]/g, "").trim();
                  summary = plain.slice(0, 120) + (plain.length > 120 ? "..." : "");
                }

                return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="gradient-primary rounded-xl p-3">
                      <Activity className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">REPORT_{reportNum}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Status: Low {lowCount} | Normal {normalCount} | High {highCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit saved prompt"
                      onClick={() => void onEditPrompt(r)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Download PDF"
                      onClick={() => downloadPdf(r)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete report"
                      onClick={() => void onDeleteReport(r.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
