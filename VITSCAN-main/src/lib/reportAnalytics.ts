import type { AuthUser, Report } from "@/components/services/aiApi";

export type Severity = "mild" | "moderate" | "severe";

export type ParsedVitaminResult = {
  vitamin: string;
  confidence: number;
  severity: Severity;
  status: string;
  foods: string;
  precaution: string;
  supplement: string;
  requiredValue: number;
  currentValue: number;
  unit: string;
  statusLabel: "Low" | "Normal" | "High";
};

export type ParsedAnalysis = {
  overallConfidence: number;
  biomarkersAnalyzed: number;
  summary: string;
  results: ParsedVitaminResult[];
};

const DEFAULT_RANGES: Record<string, { required: number; unit: string }> = {
  "Vitamin A": { required: 900, unit: "mcg" },
  "Vitamin B12": { required: 2.4, unit: "mcg" },
  "Vitamin C": { required: 90, unit: "mg" },
  "Vitamin D": { required: 600, unit: "IU" },
  "Vitamin E": { required: 15, unit: "mg" },
  "Vitamin K": { required: 120, unit: "mcg" },
  Iron: { required: 8, unit: "mg" },
  Zinc: { required: 11, unit: "mg" },
  Protein: { required: 56, unit: "g" },
};

function normalizeSeverity(value: string): Severity {
  const lower = value.toLowerCase();
  if (lower.includes("severe")) {
    return "severe";
  }
  if (lower.includes("moderate")) {
    return "moderate";
  }
  return "mild";
}

function normalizeName(name: string): string {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("vitamin ")) {
    return `Vitamin ${trimmed.slice(8).trim().toUpperCase()}`;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function getRequiredRange(vitamin: string, user?: AuthUser | null): { required: number; unit: string } {
  const fallback = DEFAULT_RANGES[vitamin] ?? { required: 100, unit: "units" };
  if (!user) {
    return fallback;
  }

  // Basic demographic adjustment so recommendations reflect profile context.
  const userAge = Number(user.age ?? 0);
  const ageFactor = userAge > 50 ? 1.1 : userAge > 0 && userAge < 18 ? 0.9 : 1;
  const genderLower = String((user as { gender?: string }).gender ?? "").toLowerCase();
  const genderFactor = vitamin === "Iron" && genderLower === "female" ? 2.25 : 1;

  return {
    required: Number((fallback.required * ageFactor * genderFactor).toFixed(2)),
    unit: fallback.unit,
  };
}

function parseLooseJson(rawOutput: string): {
  overall_confidence?: number;
  biomarkers_analyzed?: number;
  summary?: string;
  results?: Array<{
    vitamin?: string;
    confidence?: number;
    severity?: string;
    status?: string;
    foods?: string;
    precaution?: string;
    supplement?: string;
    required_value?: number;
    current_value?: number;
    unit?: string;
  }>;
} | null {
  const cleaned = rawOutput.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSlice);
    } catch {
      return null;
    }
  }
}

function inferCurrentValue(required: number, severity: Severity, confidence: number): number {
  const base = severity === "severe" ? 0.48 : severity === "moderate" ? 0.7 : 0.9;
  const confidenceAdjust = Math.max(0.85, Math.min(1.1, confidence / 100 + 0.25));
  return Number((required * base * confidenceAdjust).toFixed(2));
}

function computeStatusLabel(currentValue: number, requiredValue: number): "Low" | "Normal" | "High" {
  if (requiredValue <= 0) {
    return "Normal";
  }
  const ratio = currentValue / requiredValue;
  if (ratio < 0.85) {
    return "Low";
  }
  if (ratio > 1.15) {
    return "High";
  }
  return "Normal";
}

export function parseReportOutput(output: string, user?: AuthUser | null): ParsedAnalysis | null {
  try {
    const parsed = parseLooseJson(output);

    if (!parsed || !Array.isArray(parsed.results)) {
      return null;
    }

    const results = parsed.results
      .filter((item) => item.vitamin)
      .map((item) => {
        const vitamin = normalizeName(item.vitamin ?? "Unknown");
        const confidence = Math.max(0, Math.min(100, Number(item.confidence ?? 0)));
        const severity = normalizeSeverity(item.severity ?? "mild");
        const defaults = getRequiredRange(vitamin, user);
        const requiredValueRaw = Number(item.required_value ?? defaults.required);
        const requiredValue = Number.isFinite(requiredValueRaw) && requiredValueRaw > 0 ? requiredValueRaw : defaults.required;
        const currentValueRaw = Number(item.current_value ?? inferCurrentValue(requiredValue, severity, confidence));
        const currentValue = Number.isFinite(currentValueRaw) ? currentValueRaw : inferCurrentValue(requiredValue, severity, confidence);
        const unit = item.unit ?? defaults.unit;

        return {
          vitamin,
          confidence,
          severity,
          status: item.status ?? "No status available",
          foods: item.foods ?? "Balanced whole-food diet",
          precaution: item.precaution ?? "Consult a clinician for persistent symptoms",
          supplement: item.supplement ?? "Not required",
          requiredValue,
          currentValue,
          unit,
          statusLabel: computeStatusLabel(currentValue, requiredValue),
        } satisfies ParsedVitaminResult;
      });

    return {
      overallConfidence: Number(parsed.overall_confidence ?? 0),
      biomarkersAnalyzed: Number(parsed.biomarkers_analyzed ?? 0),
      summary: String(parsed.summary ?? ""),
      results,
    };
  } catch {
    return null;
  }
}

export type ReportTimelinePoint = {
  id: string;
  dateLabel: string;
  fullDate: string;
  healthScore: number;
  lowCount: number;
  normalCount: number;
  highCount: number;
  biomarkerLabel: string;
};

export function buildReportTimeline(reports: Report[], user?: AuthUser | null): ReportTimelinePoint[] {
  return reports
    .slice()
    .reverse()
    .map((report) => {
      const parsed = parseReportOutput(report.output, user);
      const date = new Date(report.date);
      const safeResults = parsed?.results ?? [];
      const score = safeResults.length
        ? Math.round(
            safeResults.reduce((sum, row) => sum + Math.min(140, (row.currentValue / Math.max(1, row.requiredValue)) * 100), 0) /
              safeResults.length,
          )
        : 0;

      const lowCount = safeResults.filter((row) => row.statusLabel === "Low").length;
      const normalCount = safeResults.filter((row) => row.statusLabel === "Normal").length;
      const highCount = safeResults.filter((row) => row.statusLabel === "High").length;

      return {
        id: report.id,
        dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        healthScore: Math.max(0, Math.min(100, score)),
        lowCount,
        normalCount,
        highCount,
        biomarkerLabel: report.files.join(", ") || "Scan",
      };
    });
}
