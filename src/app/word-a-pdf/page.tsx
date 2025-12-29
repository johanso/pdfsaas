import type { Metadata } from "next";
import WordToPdfClient from "./client";

export const metadata: Metadata = {
  title: "Word a PDF - Convierte documentos DOC y DOCX a PDF gratis",
  description: "Convierte archivos de Microsoft Word a PDF de forma rápida y gratuita. Mantiene el formato original de tus documentos.",
};

export default function WordToPdfPage() {
  return <WordToPdfClient />;
}
