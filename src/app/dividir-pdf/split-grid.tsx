"use client";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSplitGroupColor } from "@/lib/split-colors";

const PdfThumbnail = dynamic(() => import("@/components/pdf-thumbnail").then(mod => mod.PdfThumbnail), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
});

interface SplitGridProps {
  file: File;
  numPages: number;
  mode: "ranges" | "fixed";
  ranges: number[]; // Indices of pages after which a split occurs (1-based index to match visual page numbers)
  fixedSize?: number; // Size of fixed groups
  onRangeClick: (pageIndex: number) => void;
}

export function SplitGrid({
  file,
  numPages,
  mode,
  ranges,
  fixedSize,
  onRangeClick,
}: SplitGridProps) {
  // Generate array of page numbers 1..N
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  // Helper to determine background color for groups
  const getGroupColor = (pageIndex: number) => {
    let groupIndex = 0;

    if (mode === "ranges") {
      // Count how many splits are *before* this page
      groupIndex = ranges.filter(r => r < pageIndex).length;
    } else if (mode === "fixed" && fixedSize && fixedSize > 0) {
      // Calculate group based on fixed size
      groupIndex = Math.floor((pageIndex - 1) / fixedSize);
    } else {
      return "bg-white dark:bg-zinc-900";
    }

    const color = getSplitGroupColor(groupIndex);
    return `${color.bg} ${color.border}`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20 select-none">
      {pages.map((pageNumber) => {
        const isSplit = ranges.includes(pageNumber);
        const isLast = pageNumber === numPages;

        return (
          <div key={pageNumber} className="relative group">
            {/* Page Card */}
            <Card
              className={cn(
                "overflow-hidden border-3 w-full aspect-3/4",
                getGroupColor(pageNumber),
                "p-0"
              )}
            >
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header: Page Number */}
                <div className="h-8 bg-zinc-50 dark:bg-zinc-800/50 border-b flex items-center justify-between px-2 shrink-0">
                  <span className="text-xs text-zinc-500 font-medium truncate select-none">
                    Página {pageNumber}
                  </span>
                </div>

                {/* Thumbnail Area */}
                <div className="flex-1 relative flex items-center justify-center bg-zinc-100 dark:bg-zinc-900/50 overflow-hidden p-2">
                  <div className="w-full h-full rounded overflow-hidden">
                    <PdfThumbnail file={file} pageNumber={pageNumber} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scissor Button Overlay (Only if not last page and in ranges mode) */}
            {!isLast && mode === "ranges" && (
              <>
                {/* Visual Line */}
                <div className={cn(
                  "absolute h-full w-0.5 z-10 -right-[.55rem] top-0 transition-colors",
                  isSplit
                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    : "bg-zinc-200 group-hover:bg-zinc-400")} />

                {/* Scissor Button */}
                <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-6 h-6 rounded-full border shadow-sm transition-all",
                      isSplit
                        ? "bg-red-500 text-white border-red-600 hover:bg-red-600 hover:text-white"
                        : "bg-white dark:bg-zinc-800 text-zinc-400 border-dashed border-zinc-400 dark:border-zinc-700 hover:text-zinc-600 hover:border-zinc-400 dark:hover:text-zinc-200"
                    )}
                    onClick={() => onRangeClick(pageNumber)}
                  >
                    <Scissors className={cn("w-3 h-3", isSplit && "text-white")} />
                  </Button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
