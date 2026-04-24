import { motion } from "framer-motion";
import { Cpu, Eye, Layers, Zap } from "lucide-react";

const techStack = [
  {
    icon: Eye,
    name: "ResNet152V2",
    description: "Deep residual network for high-accuracy skin and oral image classification with transfer learning.",
    tag: "Image Classification",
  },
  {
    icon: Layers,
    name: "Vision Transformer (ViT)",
    description: "Attention-based model capturing global image patterns for biomarker feature extraction.",
    tag: "Feature Extraction",
  },
  {
    icon: Cpu,
    name: "FLAN-T5",
    description: "Large language model powering our medical chatbot for personalized health Q&A.",
    tag: "Medical NLP",
  },
  {
    icon: Zap,
    name: "Multi-Model Fusion",
    description: "Confidence-weighted ensemble combining all models for clinical-grade prediction accuracy.",
    tag: "Fusion Engine",
  },
];

export function LandingTechStack() {
  return (
    <section id="tech" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            AI <span className="gradient-text">Technology Stack</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            State-of-the-art deep learning models working in concert for comprehensive vitamin analysis.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 space-y-4 group hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="gradient-primary rounded-xl p-2.5 group-hover:scale-110 transition-transform">
                  <tech.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {tech.tag}
                </span>
              </div>
              <h3 className="font-bold text-lg">{tech.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
