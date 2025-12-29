import type { Metadata } from "next";
import RotatePdfClient from "./client";

export const metadata: Metadata = {
  title: "Rotar PDF - Gira páginas PDF online gratis",
  description: "Herramienta online gratuita para rotar páginas en archivos PDF. Gira tus PDFs permanentemente y guárdalos.",
};

export default function RotatePdfPage() {
  return <RotatePdfClient />;
}
