import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { signPdfContent } from "@/content/tools/sign-pdf";
import { ToolLoadingSkeleton } from "@/components/tool-loading-skeleton";

const SignPdfClient = dynamic(() => import("./client"), {
  loading: () => <ToolLoadingSkeleton />,
});
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
