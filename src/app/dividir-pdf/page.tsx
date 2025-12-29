import type { Metadata } from "next";
import SplitPdfClient from "./client";

export const metadata: Metadata = {
  title: "Dividir PDF - Extrae páginas de archivos PDF online",
  description: "Divide tu PDF en múltiples archivos o extrae páginas específicas. Herramienta gratuita para separar PDFs.",
};

export default function SplitPdfPage() {
  return <SplitPdfClient />;
}
