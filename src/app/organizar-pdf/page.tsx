import type { Metadata } from "next";
import OrganizePdfClient from "./client";

export const metadata: Metadata = {
  title: "Organizar PDF - Ordenar, rotar y eliminar páginas online",
  description: "Organiza tus archivos PDF gratis. Ordena páginas, rota documentos y elimina páginas innecesarias fácilmente.",
};

export default function OrganizePdfPage() {
  return <OrganizePdfClient />;
}
