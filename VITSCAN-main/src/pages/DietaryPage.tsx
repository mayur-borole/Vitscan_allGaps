import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Plus, Droplets, Flame, Wheat, Apple, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getReports, type Report } from "@/components/services/aiApi";
import { parseReportOutput } from "@/lib/reportAnalytics";
import { useAuth } from "@/components/auth/AuthProvider";
import { Link } from "react-router-dom";

interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  time: string;
}

export default function DietaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FoodEntry[]>([
    { id: 1, name: "Oatmeal with berries", calories: 320, time: "8:00 AM" },
    { id: 2, name: "Grilled chicken salad", calories: 480, time: "12:30 PM" },
    { id: 3, name: "Greek yogurt", calories: 150, time: "3:00 PM" },
  ]);

  const [newFood, setNewFood] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReports()
      .then((rows) => setReports(rows))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dietary insights."))
      .finally(() => setLoading(false));
  }, []);

  const latest = reports[0] ? parseReportOutput(reports[0].output, user) : null;

  const nutrientGoals = useMemo(
    () => [
      {
        name: "Calories",
        icon: Flame,
        current: Math.max(1200, 1500 + (latest?.overallConfidence ?? 0) * 5),
        goal: 2200,
        unit: "kcal",
      },
      {
        name: "Protein",
        icon: Wheat,
        current: Number(latest?.results.find((r) => r.vitamin === "Protein")?.currentValue ?? 55),
        goal: Number(latest?.results.find((r) => r.vitamin === "Protein")?.requiredValue ?? 75),
        unit: "g",
      },
      {
        name: "Fiber",
        icon: Apple,
        current: 18,
        goal: 30,
        unit: "g",
      },
      {
        name: "Water",
        icon: Droplets,
        current: 5,
        goal: 8,
        unit: "cups",
      },
    ],
    [latest],
  );

  const suggestedFoods = useMemo(() => {
    const source = latest?.results ?? [];
    if (!source.length) {
      return [] as Array<{ name: string; reason: string; vitamins: string[] }>;
    }

    return source
      .filter((item) => item.statusLabel === "Low")
      .slice(0, 6)
      .map((item) => ({
        name: item.vitamin,
        reason: `${item.status}. Aim for ${item.requiredValue} ${item.unit} (current ${item.currentValue} ${item.unit}).`,
        vitamins: [item.vitamin.replace("Vitamin ", "")],
      }));
  }, [latest]);

  const addEntry = () => {
    if (!newFood.trim()) return;
    setEntries((prev) => [...prev, { id: Date.now(), name: newFood, calories: Math.floor(Math.random() * 300) + 100, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setNewFood("");
  };

  return (
    <DashboardLayout title="Dietary Log">
      <div className="max-w-5xl mx-auto space-y-6">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6 text-center text-destructive">{error}</div>
        )}

        {!loading && !error && !latest && (
          <div className="glass-card rounded-3xl p-10 text-center border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold mb-2">No dietary insights yet</p>
            <p className="text-muted-foreground mb-5">
              Complete one scan to receive personalized food recommendations.
            </p>
            <Button variant="gradient" asChild>
              <Link to="/upload">Capture or Upload First Scan</Link>
            </Button>
          </div>
        )}

        {!loading && !error && latest && (
          <>
        {/* Nutrient Progress */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nutrientGoals.map((n, i) => (
            <motion.div
              key={n.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <n.icon className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{n.name}</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(n.current)}<span className="text-sm font-normal text-muted-foreground"> / {Math.round(n.goal)} {n.unit}</span></p>
              <Progress value={Math.min(100, (n.current / Math.max(1, n.goal)) * 100)} className="h-2" />
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Food Log */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold">Today's Food Log</h3>
            <div className="flex gap-2">
              <input
                value={newFood}
                onChange={(e) => setNewFood(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addEntry()}
                placeholder="Add food item..."
                className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button variant="gradient" size="icon" onClick={addEntry}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{entry.calories} cal</span>
                    <button onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-bold">AI-Suggested Foods</h3>
            <p className="text-xs text-muted-foreground">Based on your deficiency profile</p>
            <div className="space-y-3">
              {suggestedFoods.length === 0 && (
                <p className="text-sm text-muted-foreground">No low markers right now. Keep your balanced diet and hydration routine.</p>
              )}
              {suggestedFoods.map((food) => (
                <div key={food.name} className="p-3 rounded-xl bg-muted/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{food.name}</p>
                    <div className="flex gap-1">
                      {food.vitamins.map((v) => (
                        <span key={v} className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{v}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{food.reason}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
