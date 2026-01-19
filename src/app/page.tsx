import { Metadata } from 'next'
import Features from "@/components/layout/features";
import Hero from "@/components/layout/hero";
import HowItWorks from "@/components/layout/howItWorks";
import CTA from "@/components/layout/cta";
import FaqsHome from "@/components/layout/faqs";

export const metadata: Metadata = {
  title: "Herramientas PDF Online Gratis - Unir, Dividir, Comprimir y Convertir",
  description: "La mejor suite online para gestionar PDFs. Une, divide, comprime, convierte y edita tus documentos PDF gratis. Sin instalación, seguro y fácil de usar.",
  keywords: [
    "herramientas pdf",
    "pdf online gratis",
    "unir pdf",
    "comprimir pdf",
    "convertir pdf",
    "editor pdf online",
    "ilovepdf alternativa",
    "smallpdf alternativa"
  ],
  openGraph: {
    title: "Gestiona tus PDFs Online Gratis y Seguro",
    description: "Todas las herramientas que necesitas para tus documentos en un solo lugar. Rápido, fácil y sin registros.",
    type: "website",
    url: "/", // Tu dominio
    siteName: "TuMarca PDF",
    images: [
      {
        url: "/og-home.jpg", // Asegúrate de tener una imagen general atractiva
        width: 1200,
        height: 630,
        alt: "Suite de herramientas PDF",
      },
    ],
  },
};

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
      <FaqsHome />
    </main>
  );
}
