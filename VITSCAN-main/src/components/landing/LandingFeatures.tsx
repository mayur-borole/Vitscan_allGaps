import { Brain, BarChart3, MessageCircle, FileDown } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Brain,
    title: "Multi-Biomarker AI Fusion",
    description: "ResNet152V2 + Vision Transformer models fuse skin, tongue, lips, and nail image data for comprehensive analysis.",
  },
  {
    icon: BarChart3,
    title: "Severity Detection",
    description: "Color-coded severity levels (Mild / Moderate / Severe) with confidence scores for each vitamin deficiency.",
  },
  {
    icon: MessageCircle,
    title: "Medical AI Chatbot",
    description: "FLAN-T5 powered chatbot answers your questions about deficiencies, diet, and treatment options.",
  },
  {
    icon: FileDown,
    title: "Downloadable Health Report",
    description: "Generate professional PDF reports with biomarker images, predictions, and doctor consultation recommendations.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Powered by <span className="gradient-text">Advanced AI</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our multi-model fusion architecture delivers clinical-grade vitamin deficiency detection from simple images.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card rounded-2xl p-6 hover:shadow-2xl hover:shadow-sky-200/50 transition-all duration-300 group"
            >
              <div className="gradient-primary rounded-xl p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
