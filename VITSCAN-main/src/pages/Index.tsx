import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingTechStack } from "@/components/landing/LandingTechStack";
import { LandingSecurity } from "@/components/landing/LandingSecurity";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingTechStack />
      <LandingSecurity />
      <LandingTestimonials />
      <LandingFooter />
    </div>
  );
};

export default Index;
