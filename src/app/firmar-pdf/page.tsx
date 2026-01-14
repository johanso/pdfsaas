import type { Metadata } from "next";
import { signPdfContent } from "@/content/tools/sign-pdf";
import SignPdfClient from "./client";
import { ToolPageLayout } from "@/components/tool-page-layout";

export const metadata: Metadata = {
  title: signPdfContent.metadata.title,
  description: signPdfContent.metadata.description,
  keywords: signPdfContent.metadata.keywords,
  alternates: {
    canonical: signPdfContent.metadata.canonical,
  },
};

export default function SignPdfPage() {
  return (
    <ToolPageLayout data={signPdfContent} categoryId="SECURITY">
      <SignPdfClient />
    </ToolPageLayout>
  );
}
