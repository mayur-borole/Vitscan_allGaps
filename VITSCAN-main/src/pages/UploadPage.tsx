import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Loader2, CheckCircle2, AlertCircle, FileDown, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { analyzeImages } from "@/components/services/aiApi";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";

const zones = [
  { id: "eyes", label: "Eyes", marker: "👁️", desc: "Capture a clear close-up of your eyes in natural light" },
  { id: "gums", label: "Gums", marker: "🦷", desc: "Photograph upper/lower gums with good lighting" },
  { id: "hair", label: "Hair", marker: "💇", desc: "Capture scalp and hair texture from top/front view" },
  { id: "palms", label: "Palms", marker: "✋", desc: "Take a focused photo of your palm lines and skin tone" },
  { id: "tongue", label: "Tongue", marker: "👅", desc: "Capture the tongue surface in bright, even lighting" },
  { id: "skin", label: "Skin", marker: "🧴", desc: "Capture a clear skin patch showing tone and texture" },
  { id: "lips", label: "Lips", marker: "👄", desc: "Photograph lips to assess color and hydration cues" },
  { id: "nails", label: "Nails", marker: "💅", desc: "Capture fingernails clearly without nail polish if possible" },
];

type ZoneImage = {
  file: File;
  previewUrl: string;
};

export default function UploadPage() {
  const [images, setImages] = useState<Record<string, ZoneImage | null>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraZoneId, setCameraZoneId] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      Object.values(images).forEach((entry) => {
        if (entry?.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl);
        }
      });
    };
  }, [images]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraOpen(false);
    setCameraZoneId(null);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const openCamera = async (zoneId: string) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Your browser does not support camera capture.");
      return;
    }

    setCameraError(null);
    setCameraZoneId(zoneId);
    setCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setCameraStream(stream);
    } catch {
      setCameraError("Camera permission denied or no camera detected.");
    }
  };

  const captureFromCamera = () => {
    if (!cameraZoneId || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("Could not read camera frame.");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("Failed to capture image.");
          return;
        }
        const capturedFile = new File([blob], `${cameraZoneId}-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        handleFile(cameraZoneId, capturedFile);
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  const openPicker = (zoneId: string) => {
    if (analyzing || done) {
      return;
    }

    const input = document.getElementById(`zone-input-${zoneId}`) as HTMLInputElement | null;
    input?.click();
  };

  const handleFile = (zoneId: string, file?: File) => {
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImages((prev) => {
      const oldPreview = prev[zoneId]?.previewUrl;
      if (oldPreview) {
        URL.revokeObjectURL(oldPreview);
      }
      return {
        ...prev,
        [zoneId]: { file, previewUrl },
      };
    });
    setError(null);
  };

  const removeImage = (zoneId: string) => {
    setImages((prev) => {
      const oldPreview = prev[zoneId]?.previewUrl;
      if (oldPreview) {
        URL.revokeObjectURL(oldPreview);
      }
      return { ...prev, [zoneId]: null };
    });
  };

  const handleAnalyze = async () => {
    const selected = zones
      .map((zone) => ({ zone, entry: images[zone.id] }))
      .filter((item): item is { zone: (typeof zones)[number]; entry: ZoneImage } => Boolean(item.entry));

    const selectedFiles = selected.map((item) => item.entry.file);
    const selectedAreas = selected.map((item) => item.zone.label);
    if (selectedFiles.length === 0) {
      return;
    }

    setError(null);
    setDone(false);
    setAnalyzing(true);
    setProgress(0);

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return 90;
        }
        return prev + 3;
      });
    }, 120);

    try {
      const result = await analyzeImages(selectedFiles, undefined, selectedAreas);
      window.clearInterval(interval);
      setAnalysisOutput(result.output);
      sessionStorage.setItem("vitscan_analysis_output", result.output);
      setProgress(100);
      setAnalyzing(false);
      setDone(true);
    } catch (err) {
      window.clearInterval(interval);
      setProgress(0);
      setAnalyzing(false);
      setError(err instanceof Error ? err.message : "Failed to analyze images.");
    }
  };

  const uploadedCount = Object.values(images).filter(Boolean).length;

  const getStageLabel = (p: number) => {
    if (p < 20) return "Preprocessing images...";
    if (p < 45) return "Running image classifier...";
    if (p < 70) return "Applying model analysis...";
    if (p < 90) return "Fusing outputs...";
    return "Generating confidence scores...";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between border-b border-border/50 px-4 glass-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-lg font-bold">New Scan</h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Multi-Area Scan</h2>
                <p className="text-muted-foreground">Capture or upload clear images for Eyes, Gums, Hair, Palms, Tongue, Skin, Lips, and Nails.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {zones.map((zone) => (
                  <motion.div
                    key={zone.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`glass-card rounded-2xl p-6 text-center space-y-3 cursor-pointer relative overflow-hidden group border-2 transition-colors ${images[zone.id] ? "border-primary/50" : "border-transparent hover:border-primary/20"}`}
                    onClick={() => openPicker(zone.id)}
                  >
                    <input
                      id={`zone-input-${zone.id}`}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        handleFile(zone.id, file);
                        event.target.value = "";
                      }}
                    />
                    {images[zone.id] ? (
                      <>
                        <div className="w-full h-28 rounded-xl bg-muted overflow-hidden">
                          <img
                            src={images[zone.id]?.previewUrl}
                            alt={`${zone.label} upload preview`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(zone.id);
                          }}
                          className="absolute top-3 right-3 bg-destructive/90 rounded-full p-1 hover:scale-110 transition-transform"
                        >
                          <X className="h-3 w-3 text-destructive-foreground" />
                        </button>
                        <p className="text-sm font-medium text-primary flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> {zone.label} ready
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-5xl">{zone.marker}</div>
                        <p className="font-semibold">{zone.label}</p>
                        <p className="text-xs text-muted-foreground">{zone.desc}</p>
                        <div className="flex justify-center gap-4">
                          <button
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            onClick={(event) => {
                              event.stopPropagation();
                              openPicker(zone.id);
                            }}
                          >
                            <Upload className="h-3.5 w-3.5" /> Upload {zone.label}
                          </button>
                          <button
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            onClick={(event) => {
                              event.stopPropagation();
                              void openCamera(zone.id);
                            }}
                          >
                            <Camera className="h-3.5 w-3.5" /> Scan {zone.label}
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {error && (
                <div className="glass-card rounded-2xl p-4 border border-destructive/30 text-destructive flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <AnimatePresence>
                {cameraOpen && (
                  <motion.div
                    key="camera-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="w-full max-w-xl rounded-2xl border border-border/40 bg-background p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Camera Capture</h3>
                        <Button variant="ghost" size="icon" onClick={stopCamera}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="rounded-xl overflow-hidden bg-muted border border-border/50 aspect-video flex items-center justify-center">
                        {cameraError ? (
                          <div className="text-center text-destructive text-sm px-6">
                            <CameraOff className="h-8 w-8 mx-auto mb-2" />
                            {cameraError}
                          </div>
                        ) : (
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                        <Button variant="gradient" onClick={captureFromCamera} disabled={Boolean(cameraError)}>
                          Capture Image
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {analyzing && (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card rounded-2xl p-8 text-center space-y-4"
                  >
                    <div className="relative mx-auto w-16 h-16">
                      <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                    <p className="font-bold text-lg">AI Processing...</p>
                    <p className="text-sm text-muted-foreground">{getStageLabel(progress)}</p>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full gradient-primary rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{progress}% complete</p>
                  </motion.div>
                )}

                {done && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-8 text-center space-y-4"
                  >
                    <CheckCircle2 className="h-14 w-14 mx-auto text-severity-mild" />
                    <p className="font-bold text-xl">Analysis Complete!</p>
                    {(() => {
                      try {
                        const cleaned = analysisOutput.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
                        const data = JSON.parse(cleaned);
                        if (data.results && Array.isArray(data.results)) {
                          const severe = data.results.filter((r: { severity: string }) => r.severity === "severe").length;
                          const moderate = data.results.filter((r: { severity: string }) => r.severity.includes("moderate")).length;
                          return (
                            <>
                              <div className="text-left rounded-xl bg-muted/40 border border-border/40 p-4 max-h-72 overflow-auto">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">AI Analysis</p>
                                <p className="text-sm text-foreground/80 mb-3">{data.summary}</p>
                                <div className="space-y-2">
                                  {data.results.map((r: { vitamin: string; severity: string; status: string }, i: number) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                      <span className={`inline-block mt-0.5 w-2 h-2 rounded-full shrink-0 ${r.severity === "severe" ? "bg-red-500" : r.severity.includes("moderate") ? "bg-yellow-500" : "bg-green-500"}`} />
                                      <span><strong>{r.vitamin}</strong> — {r.status}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-center gap-8">
                                <div>
                                  <p className="text-2xl font-bold gradient-text">{data.overall_confidence}%</p>
                                  <p className="text-xs text-muted-foreground">Confidence</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-severity-severe">{severe}</p>
                                  <p className="text-xs text-muted-foreground">Severe</p>
                                </div>
                                <div>
                                  <p className="text-2xl font-bold text-severity-moderate">{moderate}</p>
                                  <p className="text-xs text-muted-foreground">Moderate</p>
                                </div>
                              </div>
                            </>
                          );
                        }
                      } catch { /* not JSON */ }
                      // Fallback: show raw markdown
                      return (
                        <div className="text-left rounded-xl bg-muted/40 border border-border/40 p-4 max-h-72 overflow-auto">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">AI Analysis</p>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                            <ReactMarkdown>{analysisOutput}</ReactMarkdown>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="flex gap-3 justify-center">
                      <Button variant="gradient" size="lg" asChild>
                        <Link to="/results" state={{ analysisOutput }}>View Full Results</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
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
                          doc.text(`Date: ${new Date().toLocaleString()}`, margin, y);
                          y += 8;

                          // Try to parse structured JSON
                          let parsed = null;
                          try {
                            const cleaned = analysisOutput.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
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
                            y += 4;
                            doc.setDrawColor(200);
                            doc.line(margin, y, pageWidth - margin, y);
                            y += 8;
                            doc.setFontSize(10);
                            doc.setTextColor(0);
                            const lines = doc.splitTextToSize(analysisOutput, maxWidth) as string[];
                            for (const line of lines) {
                              if (y > doc.internal.pageSize.getHeight() - 20) { doc.addPage(); y = 20; }
                              doc.text(line, margin, y);
                              y += 5;
                            }
                          }

                          doc.setFontSize(8);
                          doc.setTextColor(150);
                          doc.text("Disclaimer: This is an AI-generated report and not a medical diagnosis. Consult a healthcare professional.", margin, doc.internal.pageSize.getHeight() - 10);

                          doc.save(`vitscan-report-${new Date().toISOString().slice(0, 10)}.pdf`);
                        }}
                      >
                        <FileDown className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!analyzing && !done && (
                <div className="text-center">
                  <Button
                    variant="gradient"
                    size="xl"
                    disabled={uploadedCount === 0}
                    onClick={handleAnalyze}
                  >
                    Analyze {uploadedCount > 0 ? `${uploadedCount} Image${uploadedCount > 1 ? "s" : ""}` : "Images"}
                  </Button>
                  {uploadedCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">{uploadedCount} of 4 scan areas uploaded</p>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
