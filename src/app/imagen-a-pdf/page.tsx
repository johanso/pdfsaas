import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/tool-page-layout";
import { imageToPdfContent } from "@/content/tools";
import { ToolLoadingSkeleton } from "@/components/tool-loading-skeleton";

const ImageToPdfClient = dynamic(() => import("./client"), {
  loading: () => <ToolLoadingSkeleton />,
});

const { metadata: meta, jsonLd } = imageToPdfContent;

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

export default function ExtractPdfPage() {
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <ToolPageLayout data={imageToPdfContent} categoryId="CONVERT_TO_PDF">
        <ImageToPdfClient />
      </ToolPageLayout>
    </>
  );
}