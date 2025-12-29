import type { Metadata } from "next";
import ExcelToPdfClient from "./client";

export const metadata: Metadata = {
  title: "Excel a PDF - Convierte hojas de cálculo XLS y XLSX a PDF gratis",
  description: "Convierte archivos de Microsoft Excel a PDF fácilmente. Mantén el formato de tus hojas de cálculo en un documento portátil y seguro.",
};

export default function ExcelToPdfPage() {
  return <ExcelToPdfClient />;
}
