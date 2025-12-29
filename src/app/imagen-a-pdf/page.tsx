import type { Metadata } from "next";
import ImageToPdfClient from "./client";

export const metadata: Metadata = {
  title: "Imagen a PDF - Convierte JPG, PNG a PDF gratis",
  description: "Convierte imágenes JPG, PNG, WEBP a PDF fácilmente. Herramienta online gratuita para crear archivos PDF desde imágenes.",
};

export default function ImageToPdfPage() {
  return <ImageToPdfClient />;
}