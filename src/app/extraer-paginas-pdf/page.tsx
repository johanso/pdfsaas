import type { Metadata } from "next";
import ExtractPdfClient from "./client";

export const metadata: Metadata = {
  title: "Extraer páginas de PDF - Herramienta online gratuita",
  description: "Extrae páginas específicas de tus archivos PDF y guárdalas como documentos separados o unidos. Gratis y fácil de usar.",
};

export default function ExtractPdfPage() {
  return <ExtractPdfClient />;
}