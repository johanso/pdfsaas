import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/tool-page-layout";
import { splitPdfContent as SplitPdfPage } from "@/content/tools";
import SplitPdfClient from "./client";

const { metadata: meta, jsonLd } = SplitPdfPage;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: {
    canonical: meta.canonical,
  },
  openGraph: {
    title: meta.title,
    description: meta.description,
    type: "website",
    url: meta.canonical,
    siteName: "PDF SaaS",
    images: meta.ogImage ? [
      {
        url: meta.ogImage,
        width: 1200,
        height: 630,
        alt: meta.title,
      },
    ] : undefined,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function UnirPdfPage() {
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <ToolPageLayout data={SplitPdfPage} categoryId="ORGANIZE">
        <SplitPdfClient />
      </ToolPageLayout>
    </>
  );
}