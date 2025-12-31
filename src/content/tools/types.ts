import type { ComponentType } from "react";

export interface LucideIconProps {
  className?: string;
  size?: number | string;
}

export interface ToolStep {
  number: string;
  title: string;
  description: string;
}

export interface ToolBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolCta {
  title: string;
  description: string;
  buttonLabel: string;
}

export interface ToolMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  ogImage?: string;
}

export interface ToolPageData {
  id: string;
  metadata: ToolMetadata;
  steps: ToolStep[];
  benefits: ToolBenefit[];
  faqs: ToolFaq[];
  cta: ToolCta;
  jsonLd?: Record<string, unknown>;
}