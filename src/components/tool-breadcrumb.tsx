import Link from "next/link";
import { ChevronRight, House } from "lucide-react";
import { TOOLS } from "@/lib/tools-data";
import { TOOL_CATEGORIES } from "@/lib/tools-categories";

interface ToolBreadcrumbProps {
  toolId: string;
}

export function ToolBreadcrumb({ toolId }: ToolBreadcrumbProps) {
  const tool = TOOLS[toolId];
  if (!tool) return null;

  const category = Object.values(TOOL_CATEGORIES).find(
    (cat: any) => cat.id === tool.category
  );

  return (
    <nav className="flex items-center gap-2 text-xs text-zinc-600 mb-6">
      <Link href="/" className="hover:text-primary">
        <House size={18} />
      </Link>
      <ChevronRight className="w-4 h-4" />
      {category && (
        <>
          <span className="text-muted-foreground">{category.name}</span>
          <ChevronRight className="w-4 h-4" />
        </>
      )}
      <span className="text-zinc-900 dark:text-zinc-100 font-medium">
        {tool.name}
      </span>
    </nav>
  );
}