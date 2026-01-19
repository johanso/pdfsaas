'use client';
import { useState } from "react";
import { TOOL_CATEGORIES } from "@/lib/tools-categories";
import { TOOLS } from "@/lib/tools-data";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import CardTool from "../card-tool";
import { Layers } from "lucide-react";

const Features = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const allCategories = Object.values(TOOL_CATEGORIES);

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
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header Editorial */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-primary mb-6">
            <Layers className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide uppercase">Suite Completa</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Herramientas
            <span className="block text-primary">Profesionales</span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Todo lo que necesitas para trabajar con documentos PDF.
            Procesamiento local, sin límites, sin compromisos.
          </p>
        </div>

        {/* Category Filters - Editorial Pills */}
        <div className="flex flex-wrap gap-3 mb-16">
          <Button
            variant={activeCategory === "all" ? "default" : "ghost"}
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full px-6 py-2.5 font-medium transition-all duration-300",
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                : "hover:bg-primary-soft hover:text-primary"
            )}
          >
            Todas
          </Button>
          {allCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "ghost"}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "rounded-full px-6 py-2.5 font-medium transition-all duration-300",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : "hover:bg-primary-soft hover:text-primary"
              )}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="relative">
          {/* Grid with staggered animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTools.map((tool, index) => {
              return (
                <div
                  key={`${tool.id}-${tool.categoryInfo.id}`}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardTool tool={tool} />
                </div>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-32">
              <p className="text-lg text-muted-foreground">
                No se encontraron herramientas en esta categoría.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Features;
