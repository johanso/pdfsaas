'use client';
import { useState } from "react";
import { TOOL_CATEGORIES } from "@/lib/tools-categories";
import { TOOLS } from "@/lib/tools-data";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import CardTool from "../card-tool";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {filteredTools.map((tool) => {
              return (
                <CardTool key={`${tool.id}-${tool.categoryInfo.id}`} tool={tool} />
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
