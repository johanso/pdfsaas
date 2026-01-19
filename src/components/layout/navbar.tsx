"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle";
import { TOOL_CATEGORIES } from "@/lib/tools-categories";
import { TOOLS } from "@/lib/tools-data";

import * as Icons from "lucide-react";

// Mapeo de colores para las categorías
const categoryColorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  green: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  red: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
};

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-16 border-b bg-background px-6 flex items-center">
      <div className="container flex items-center justify-between mx-auto py-10 md:px-4 max-w-7xl">
        {/* LADO IZQUIERDO: Logo */}
        <Link href="/" className="flex items-center gap-1 font-bold text-lg">
          <div className="bg-primary text-primary-foreground px-2 rounded">
            PDF
          </div>
          <span>SaaS</span>
        </Link>

        {/* LADO DERECHO: Trigger del Drawer */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="gap-2 cursor-pointer">
                <span className="hidden sm:inline">Herramientas PDF</span>
                <Grip size={32} className="!size-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Herramientas</SheetTitle>
                <SheetDescription>
                  Selecciona una herramienta para comenzar
                </SheetDescription>
              </SheetHeader>
              <div className="mt-2 space-y-8">
                {Object.values(TOOL_CATEGORIES).map(category => {
                  const categoryTools = category.tools
                    .map(toolId => TOOLS[toolId])
                    .filter(Boolean);

                  if (categoryTools.length === 0) return null;

                  const colors = categoryColorMap[category.color] || { bg: "bg-primary/10", text: "text-primary" };

                  return (
                    <div key={category.id} className="space-y-3 px-4">
                      <div className="flex items-center gap-2 px-1">
                        <h3 className="text-lg font-bold">
                          {category.name}
                        </h3>
                      </div>
                      <div className="grid">
                        {categoryTools.map(tool => {
                          const ToolIcon = (Icons as any)[tool.icon];

                          return (
                            <SheetClose asChild key={tool.id}>
                              <Link
                                href={tool.isAvailable ? tool.path : '#'}
                                className={cn(
                                  "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                  tool.isAvailable
                                    ? "hover:bg-accent hover:text-accent-foreground"
                                    : "opacity-30 cursor-not-allowed",
                                  pathname === tool.path && "bg-accent text-accent-foreground font-medium"
                                )}
                              >
                                {ToolIcon && (
                                  <div className={cn("p-1.5 rounded-md shrink-0 transition-colors",
                                    pathname === tool.path ? colors.bg : "bg-muted group-hover:" + colors.bg)}>
                                    <ToolIcon className={cn("w-4 h-4", colors.text)} />
                                  </div>
                                )}
                                <span>{tool.name}</span>
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}