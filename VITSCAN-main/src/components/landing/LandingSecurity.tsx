import { motion } from "framer-motion";
import { Shield, Lock, FileCheck, Server } from "lucide-react";

const badges = [
  { icon: Shield, label: "HIPAA Compliant", description: "Full compliance with healthcare data protection standards" },
  { icon: Lock, label: "End-to-End Encryption", description: "AES-256 encryption for all data in transit and at rest" },
  { icon: FileCheck, label: "GDPR Ready", description: "Full data privacy compliance with EU regulations" },
  { icon: Server, label: "SOC 2 Type II", description: "Enterprise-grade security controls and monitoring" },
];

export function LandingSecurity() {
  return (
    <section className="py-20 gradient-bg-soft">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-3"
        >
          <h2 className="text-3xl font-bold">
            Security & <span className="gradient-text">Privacy</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Your health data is protected by enterprise-grade security infrastructure.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-5 text-center space-y-3"
            >
              <div className="mx-auto w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <badge.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-sm">{badge.label}</h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
