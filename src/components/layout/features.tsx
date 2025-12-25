'use client';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TOOL_CATEGORIES } from "@/lib/tools-categories";
import { TOOLS } from "@/lib/tools-data";
import { Badge } from "../ui/badge";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

const categoryColorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  green: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  red: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
};

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Herramientas Poderosas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para trabajar con tus documentos PDF, directamente en tu navegador.
          </p>
        </div>

        <div className="flex flex-col gap-16 max-w-6xl mx-auto">
          {Object.values(TOOL_CATEGORIES).map((category) => {
            const categoryTools = category.tools
              .map(toolId => TOOLS[toolId])
              .filter(Boolean);

            if (categoryTools.length === 0) return null;

            const colors = categoryColorMap[category.color] || { bg: "bg-primary/10", text: "text-primary" };

            return (
              <section key={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {categoryTools.map((tool) => {
                    const ToolIcon = Icons[tool.icon as keyof typeof Icons] as any;

                    return (
                      <Link
                        key={tool.id}
                        href={tool.isAvailable ? tool.path : '#'}
                        className={!tool.isAvailable ? 'pointer-events-none' : ''}
                      >
                        <Card className={cn(
                          `group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border bg-card`,
                          !tool.isAvailable && 'opacity-30 pointer-events-none'
                        )}
                        >
                          <CardContent className="p-6 md:p-5">
                            <div className="flex items-start justify-start gap-3">
                              {ToolIcon && (
                                <div className={cn("p-2 rounded-full flex-shrink-0", colors.bg)}>
                                  <ToolIcon className={cn("w-5 h-5", colors.text)} />
                                </div>
                              )}
                              <div>
                                <h3 className="text-md font-bold text-foreground flex items-center gap-2">{tool.name}</h3>
                                {tool.isPremium && (
                                  <Badge variant="default" className="text-xs">
                                    Premium
                                  </Badge>
                                )}
                                <p className="text-sm text-muted-foreground">{tool.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
