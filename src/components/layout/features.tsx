'use client';

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TOOL_CATEGORIES } from "@/lib/tools-categories";
import { TOOLS } from "@/lib/tools-data";
import { Badge } from "../ui/badge";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  green: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", border: "border-green-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20" },
  red: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/20" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/20" },
};

const Features = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const allCategories = Object.values(TOOL_CATEGORIES);

  // Flatten all tools with their category info
  const allTools = allCategories.flatMap(category =>
    category.tools
      .map(toolId => ({
        ...TOOLS[toolId],
        categoryInfo: category
      }))
      .filter(tool => tool.id)
  );

  const filteredTools = activeCategory === "all"
    ? allTools
    : allTools.filter(tool => tool.categoryInfo.id === activeCategory);

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Herramientas Poderosas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para trabajar con tus documentos PDF, directamente en tu navegador.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => setActiveCategory("all")}
            className="rounded-full"
          >
            Todos
          </Button>
          {allCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full transition-all",
                activeCategory === category.id && "shadow-md scale-105"
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const ToolIcon = Icons[tool.icon as keyof typeof Icons] as any;
              const colors = categoryColorMap[tool.categoryInfo.color] || {
                bg: "bg-primary/10",
                text: "text-primary",
                border: "border-primary/20"
              };

              return (
                <Link
                  key={`${tool.id}-${tool.categoryInfo.id}`}
                  href={tool.isAvailable ? tool.path : '#'}
                  className={!tool.isAvailable ? 'pointer-events-none' : ''}
                >
                  <Card className={cn(
                    "group h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border-border bg-card overflow-hidden",
                    !tool.isAvailable && 'opacity-40 grayscale-[0.5]'
                  )}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-row gap-4">
                        <div className="flex items-start justify-start">
                          {ToolIcon && (
                            <div className={cn(
                              "p-3 rounded-full shrink-0 transition-transform group-hover:scale-110",
                              colors.bg
                            )}>
                              <ToolIcon className={cn("w-6 h-6", colors.text)} />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-md font-bold text-foreground group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No se encontraron herramientas en esta categoría.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Features;
