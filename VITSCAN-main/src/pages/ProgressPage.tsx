import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getReports, type Report } from "@/components/services/aiApi";
import { useAuth } from "@/components/auth/AuthProvider";
import { buildReportTimeline, parseReportOutput } from "@/lib/reportAnalytics";

const changeIcons = { up: TrendingUp, down: TrendingDown, same: Minus };
const changeColors = { up: "text-severity-mild", down: "text-severity-severe", same: "text-muted-foreground" };

export default function ProgressPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReports()
      .then((rows) => setReports(rows))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load progress data."))
      .finally(() => setLoading(false));
  }, []);

  const timeline = useMemo(() => buildReportTimeline(reports, user), [reports, user]);

  const healthScoreHistory = useMemo(
    () => timeline.map((item) => ({ month: item.dateLabel, score: item.healthScore })),
    [timeline],
  );

  const requiredVsCurrent = useMemo(() => {
    const latest = reports[0];
    if (!latest) {
      return [] as Array<{ name: string; required: number; current: number }>;
    }
    const parsed = parseReportOutput(latest.output, user);
    if (!parsed) {
      return [] as Array<{ name: string; required: number; current: number }>;
    }
    return parsed.results.map((row) => ({
      name: row.vitamin.replace("Vitamin ", ""),
      required: row.requiredValue,
      current: row.currentValue,
    }));
  }, [reports, user]);

  const trendSummary = useMemo(() => {
    if (healthScoreHistory.length < 2) {
      return { delta: 0, direction: "same" as const };
    }
    const delta = healthScoreHistory[healthScoreHistory.length - 1].score - healthScoreHistory[0].score;
    return {
      delta,
      direction: delta > 0 ? "up" : delta < 0 ? "down" : "same",
    };
  }, [healthScoreHistory]);

  return (
    <DashboardLayout title="Progress Tracker">
      <div className="max-w-6xl mx-auto space-y-6">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6 text-center text-destructive">{error}</div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="glass-card rounded-3xl p-10 text-center border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold mb-2">No progress data yet</p>
            <p className="text-muted-foreground mb-5">
              Run your first scan to unlock real trends and timeline analytics.
            </p>
            <Button variant="gradient" asChild>
              <Link to="/upload">Start New Scan</Link>
            </Button>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Health Score Trend</h3>
            <div className="flex items-center gap-1 text-sm text-severity-mild font-medium">
              {trendSummary.direction === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : trendSummary.direction === "down" ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              {Math.abs(trendSummary.delta)} pts over time
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={healthScoreHistory}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 72%, 42%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 72%, 42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="score" stroke="hsl(187, 72%, 42%)" strokeWidth={3} fill="url(#scoreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">Required vs Current (Latest Report)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={requiredVsCurrent}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="required" fill="hsl(210 30% 82%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="current" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">Status Count by Report</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeline}>
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="lowCount" stackId="a" fill="hsl(0 72% 55%)" name="Low" />
                <Bar dataKey="normalCount" stackId="a" fill="hsl(142 60% 45%)" name="Normal" />
                <Bar dataKey="highCount" stackId="a" fill="hsl(38 90% 55%)" name="High" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <h3 className="font-bold mb-6">Real Scan Timeline</h3>
          <div className="space-y-0">
            {timeline
              .slice()
              .reverse()
              .map((scan, i) => {
              const prev = timeline[timeline.length - 2 - i];
              const change: "up" | "down" | "same" = !prev
                ? "same"
                : scan.healthScore > prev.healthScore
                  ? "up"
                  : scan.healthScore < prev.healthScore
                    ? "down"
                    : "same";
              const ChangeIcon = changeIcons[change];
              const severity = scan.lowCount > 1 ? "severe" : scan.lowCount === 1 ? "moderate" : "mild";
              return (
                <div key={i} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full gradient-primary shrink-0 mt-1.5" />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border/50" />}
                  </div>
                  <div className="flex-1 pb-6 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{scan.biomarkerLabel}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> {scan.fullDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <ChangeIcon className={`h-3 w-3 ${changeColors[change]}`} />
                        <span className="text-sm font-bold">{scan.healthScore}%</span>
                      </div>
                      <SeverityBadge severity={severity} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
