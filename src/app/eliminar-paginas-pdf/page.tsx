import type { Metadata } from "next";
import DeletePagesClient from "./client";

export const metadata: Metadata = {
  title: "Eliminar páginas PDF - Editor online gratuito",
  description: "Elimina páginas de sus archivos PDF de forma rápida y sencilla. Herramienta online gratuita para eliminar páginas PDF.",
};

export default function DeletePagesPage() {
  return <DeletePagesClient />;
}
