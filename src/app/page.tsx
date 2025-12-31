import Features from "@/components/layout/features";
import Hero from "@/components/layout/hero";
import HowItWorks from "@/components/layout/howItWorks";
import CTA from "@/components/layout/cta";

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <CTA
        title="Comenzar Ahora"
        description="Empieza ahora mismo. Sin registro, sin complicaciones."
        buttonLabel="Convertir PDF"
        goto="features"
      />
    </main>
  );
}
