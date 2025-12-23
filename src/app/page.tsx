import Features from "@/components/layout/features";
import Hero from "@/components/layout/hero";
import HowItWorks from "@/components/layout/howItWorks";
import CTA from "@/components/layout/cta";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
