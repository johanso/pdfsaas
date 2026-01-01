"use client";

import { CheckCircle2, 
  Clock,
  Shield, 
  Zap, 
  FileText, 
  Scissors,
  RotateCw, 
  Minimize2, 
  Layers, 
  FileArchive,
  CheckSquare,
  FileOutput,
  MousePointerClick,
  Smartphone,
  Eraser,
  Keyboard } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TOOL_CATEGORIES } from "@/lib/tools-categories";
import { TOOLS } from "@/lib/tools-data";
import CardTool from "@/components/card-tool";
import CTA from "@/components/layout/cta";
import { ToolPageData } from "@/content/tools";

interface ToolPageLayoutProps {
  data: ToolPageData;
  children: React.ReactNode;
  categoryId?: keyof typeof TOOL_CATEGORIES;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  Scissors,
  RotateCw,
  Minimize2,
  Layers,
  FileArchive,
  CheckSquare,
  FileOutput,
  MousePointerClick,
  Smartphone,
  Eraser,
  Keyboard
};

export function ToolPageLayout({ data, children, categoryId = "ORGANIZE" }: ToolPageLayoutProps) {
  const category = TOOL_CATEGORIES[categoryId];

  const relatedTools = category.tools
    .map(toolId => ({
      ...TOOLS[toolId],
      categoryInfo: category
    }))
    .filter(tool => tool.id !== data.id && tool.isAvailable);

  return (
    <>
      {/* Cliente de la herramienta */}
      {children}

      {/* Sección: Cómo funciona */}
      <section className="py-12 md:py-16 bg-muted/80 dark:bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
              {data.titleSectionSteps || "¿Cómo funciona esta herramienta?"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Es muy sencillo. Solo sigue estos pasos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {data.steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-18 h-18 bg-primary text-primary-foreground rounded-full border-6 border-white/20 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-md text-muted-foreground">{step.description}</p>

                {index < data.steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[65%] w-[80%] border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Beneficios */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              {data.titleSectionBenefits || "¿Por qué usar nuestra herramienta?"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              La forma más rápida y segura de trabajar con tus documentos PDF.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {data.benefits.map((benefit, index) => {
              const IconComponent = iconMap[benefit.icon] || FileText;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="grow-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-md text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección: FAQs */}
      <section className="py-12 md:py-16 bg-muted/80 dark:bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              {data.titleSectionFAQ || "Preguntas Frecuentes"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas saber sobre esta herramienta.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {data.faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/70"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Sección: Herramientas relacionadas */}
      {relatedTools.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                Otras herramientas PDF
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explora más formas de trabajar con tus documentos PDF.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {relatedTools.map(tool => (
                <CardTool key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTA
        title={data.cta.title}
        description={data.cta.description}
        buttonLabel={data.cta.buttonLabel}
      />
    </>
  );
}