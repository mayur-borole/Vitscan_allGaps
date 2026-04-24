import { Activity } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 py-12 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="gradient-primary rounded-lg p-1.5">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">VitaScan<span className="gradient-text">AI</span></span>
            </div>
            <p className="text-sm text-muted-foreground">AI-powered non-invasive vitamin deficiency detection using skin and oral biomarkers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Research Papers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          © 2026 VitaScanAI. All rights reserved. For informational purposes only — not a medical diagnosis.
        </div>
      </div>
    </footer>
  );
}
