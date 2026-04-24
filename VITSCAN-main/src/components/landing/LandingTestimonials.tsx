import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Dr. Sarah Chen", role: "Dermatologist", text: "VitaScanAI detected a Vitamin D deficiency in my patient that blood tests later confirmed. Incredibly accurate non-invasive tool.", rating: 5 },
  { name: "Raj Patel", role: "Patient", text: "I uploaded photos of my tongue and nails — within seconds I had a full report. The dietary suggestions were practical and helpful.", rating: 5 },
  { name: "Dr. Emily Wong", role: "Nutritionist", text: "The multi-biomarker fusion approach is state-of-the-art. I recommend it to all my clients for preliminary screening.", rating: 5 },
];

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Trusted by <span className="gradient-text">Professionals</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
