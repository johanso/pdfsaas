import type { Metadata } from "next";
import PowerPointToPdfClient from "./client";

export const metadata: Metadata = {
  title: "PowerPoint a PDF - Convierte presentaciones PPT a PDF",
  description: "Convierte presentaciones de PowerPoint (PPT, PPTX) a PDF en segundos. Conserva el formato de tus diapositivas.",
};

export default function PowerPointToPdfPage() {
  return <PowerPointToPdfClient />;
}
