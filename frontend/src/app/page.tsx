import { Navbar, Footer } from "@/components/layout";
import {
  HeroSection,
  FeaturesSection,
  ElementQuiz,
  PricingSection,
  ExpertsSection,
  FaqSection,
  CtaSection,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ElementQuiz />
        <PricingSection />
        <ExpertsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
