import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ElementQuiz from "@/components/landing/ElementQuiz";
import PricingSection from "@/components/landing/PricingSection";
import ExpertsSection from "@/components/landing/ExpertsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";

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
