import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { useAuth } from "@/components/auth/AuthProvider";

const deficiencyData = [
  { name: "Vit A", value: 72, severity: "mild" as const },
  { name: "Vit B", value: 45, severity: "moderate" as const },
  { name: "Vit C", value: 88, severity: "mild" as const },
  { name: "Vit D", value: 32, severity: "severe" as const },
  { name: "Vit E", value: 65, severity: "moderate" as const },
  { name: "Vit K", value: 91, severity: "mild" as const },
  { name: "Mineral", value: 58, severity: "moderate" as const },
];

const recentScans = [
  { date: "Mar 7, 2026", biomarkers: "Tongue, Nails", severity: "moderate" as const, score: 74 },
  { date: "Feb 28, 2026", biomarkers: "Skin, Lips", severity: "mild" as const, score: 85 },
  { date: "Feb 15, 2026", biomarkers: "Full Scan", severity: "severe" as const, score: 52 },
];

const barColors: Record<string, string> = {
  mild: "hsl(142, 60%, 45%)",
  moderate: "hsl(38, 90%, 55%)",
  severe: "hsl(0, 72%, 55%)",
};

export function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="glass-card rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h2 className="text-2xl font-bold">{user?.name ? `${user.name} 👋` : "Your health dashboard"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This workspace is personalized to your account and private report history.
        </p>
      </div>

      {/* Top cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 flex items-center gap-6"
        >
          <div className="w-24 h-24">
            <CircularProgressbar
              value={74}
              text="74"
              styles={buildStyles({
                textSize: "28px",
                textColor: "hsl(187, 72%, 42%)",
                pathColor: "hsl(187, 72%, 42%)",
                trailColor: "hsl(210, 30%, 96%)",
              })}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Health Score</p>
            <p className="text-2xl font-bold">Good</p>
            <div className="flex items-center gap-1 text-xs text-severity-mild mt-1">
              <TrendingUp className="h-3 w-3" /> +5 from last scan
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 space-y-2"
        >
          <p className="text-sm text-muted-foreground">Total Scans</p>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">3 this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 flex flex-col justify-between"
        >
          <p className="text-sm text-muted-foreground mb-2">Quick Action</p>
          <Button variant="gradient" className="w-full" asChild>
            <Link to="/upload">Start New Analysis <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </motion.div>
      </div>

      {/* Chart + Recent Scans */}
      <div className="grid lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-3 glass-card rounded-2xl p-6"
        >
          <h3 className="font-bold mb-4">Deficiency Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deficiencyData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {deficiencyData.map((entry) => (
                  <Cell key={entry.name} fill={barColors[entry.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <h3 className="font-bold mb-4">Recent Scans</h3>
          <div className="space-y-4">
            {recentScans.map((scan) => (
              <div key={scan.date} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{scan.biomarkers}</p>
                  <p className="text-xs text-muted-foreground">{scan.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{scan.score}%</span>
                  <SeverityBadge severity={scan.severity} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
