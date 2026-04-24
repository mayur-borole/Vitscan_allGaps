import { Camera, Cpu, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Camera, step: "01", title: "Capture Biomarkers", description: "Upload or capture images of your tongue, nails, lips, and skin." },
  { icon: Cpu, step: "02", title: "AI Analysis", description: "Our multi-model AI fusion engine processes all biomarker images simultaneously." },
  { icon: ClipboardList, step: "03", title: "Get Results", description: "Receive detailed deficiency reports with severity scores and dietary recommendations." },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 gradient-bg-soft">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps to comprehensive vitamin analysis.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center space-y-4"
            >
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 gradient-primary rounded-2xl rotate-6 opacity-20" />
                <div className="relative glass-card rounded-2xl w-full h-full flex items-center justify-center">
                  <s.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <span className="text-xs font-bold text-primary tracking-widest">{s.step}</span>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
