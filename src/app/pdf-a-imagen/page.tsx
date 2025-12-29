import type { Metadata } from "next";
import PdfToImageClient from "./client";

export const metadata: Metadata = {
  title: "PDF a Imagen - Convierte PDF a JPG, PNG, WebP",
  description: "Convierte páginas PDF a imágenes de alta calidad. Soporta JPG, PNG, WebP, TIFF y BMP. Extracción rápida y segura.",
};

export default function PdfToImagePage() {
  return <PdfToImageClient />;
}