import Link from "next/link";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { Card, CardContent } from "./ui/card";

export default function CardTool({
  tool,
}: {
  tool: any;
}) {

  const ToolIcon = Icons[tool.icon as keyof typeof Icons] as any;

  return (
    <Link
      key={`${tool.id}-${tool.categoryInfo.id}`}
      href={tool.isAvailable ? tool.path : '#'}
      className={!tool.isAvailable ? 'pointer-events-none' : ''}
    >
      <Card className={cn(
        "group h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border-neutral-100 dark:border-neutral-800 bg-card overflow-hidden",
        !tool.isAvailable && 'opacity-40 grayscale-[0.5]'
      )}
      >
        {!tool.isAvailable &&
          <span className="absolute right-2 top-2 rounded-2xl px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 dark:text-gray-400 text-[10px]">Deshabilitada</span>
        }
        <CardContent className="h-full group p-4 bg-card rounded-xl border border-neutral-100 dark:border-neutral-900 hover:shadow-lg transition-all text-center">
          <div className={cn(
            "flex items-center justify-center w-18 h-10 rounded-full shrink-0 mx-auto transition-transform group-hover:scale-110 mb-2",
            `bg-${tool.categoryInfo.color}-500/10 text-${tool.categoryInfo.color}-600 dark:text-${tool.categoryInfo.color}-400 border-${tool.categoryInfo.color}-500/20`
          )}>
            <ToolIcon className={cn("w-6 h-6", tool.categoryInfo.color)} />
          </div>
          <h3 className="text-md font-bold text-foreground group-hover:text-primary transition-colors mb-1">
            {tool.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {tool.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}