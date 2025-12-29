import type { Metadata } from "next";
import UnirPdfClient from "./client";

export const metadata: Metadata = {
  title: "Unir PDF - Combina archivos PDF online gratis",
  description: "Herramienta online gratuita para unir múltiples archivos PDF en un solo documento. Une PDFs fácilmente sin instalar software.",
};

export default function UnirPdfPage() {
  return <UnirPdfClient />;
}
