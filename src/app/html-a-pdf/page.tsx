import type { Metadata } from "next";
import HtmlToPdfClient from "./client";

export const metadata: Metadata = {
  title: "HTML a PDF - Convierte páginas web y HTML a PDF",
  description: "Convierte cualquier página web o archivo HTML a PDF. Ideal para guardar artículos, facturas web y reportes.",
};

export default function HtmlToPdfPage() {
  return <HtmlToPdfClient />;
}