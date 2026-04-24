import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/gemini-generated.png";

export function LandingHero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 bg-[length:200%_200%] animate-[gradientShift_12s_ease-in-out_infinite]">
      <div className="absolute top-28 left-4 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl animate-float" />
      <div
        className="absolute bottom-10 right-8 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl animate-float"
        style={{ animationDelay: "1.2s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_40%)]" />

      <div className="container relative mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            AI-Powered Health Analysis
          </motion.div>

          <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
            AI-Powered Health Analysis
          </motion.h1>

          <motion.p variants={item} className="text-lg text-slate-600 max-w-xl leading-relaxed">
            Non-Invasive Vitamin Deficiency Detection from eyes, gums, hair, palms, tongue, skin, lips, and nails.
            Upload or capture scans and get clean, personalized health insights in seconds.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button variant="gradient" size="xl" asChild className="shadow-lg shadow-sky-300/30">
                <Link to="/upload">
                  <ScanLine className="mr-2 h-4 w-4" /> Start Scan <ArrowRight className="ml-1" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="outline" size="lg" asChild>
                <Link to="/reports">
                  <FileText className="mr-1 h-4 w-4" /> View Reports
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-6 pt-2">
            {[
              { value: "98.2%", label: "Accuracy" },
              { value: "50K+", label: "Scans Done" },
              { value: "7+", label: "Vitamins" },
              { value: "8", label: "Scan Areas" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-4"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {i > 0 && <div className="h-8 w-px bg-border" />}
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <motion.div
            className="relative w-full max-w-xl rounded-3xl border border-sky-200/60 bg-white/70 shadow-xl backdrop-blur-sm p-5"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-sky-400/20 to-emerald-400/20 blur-2xl" />
            <img
              src={heroImage}
              alt="AI-powered multi-area health scan visualization for eyes, gums, hair, palms, tongue, skin, lips, and nails"
              className="relative w-full max-h-[520px] object-contain rounded-2xl"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
