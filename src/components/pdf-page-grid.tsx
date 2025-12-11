"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

const PdfThumbnail = dynamic(() => import("@/components/pdf-thumbnail").then(mod => mod.PdfThumbnail), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
});

interface PdfPageGridProps {
    file: File;
    numPages: number;
    selectedPages: number[]; // Indices of selected pages (1-based)
    onTogglePage: (pageIndex: number) => void;
}

export function PdfPageGrid({
    file,
    numPages,
    selectedPages,
    onTogglePage,
}: PdfPageGridProps) {
    // Generate array of page numbers 1..N
    const pages = Array.from({ length: numPages }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 select-none">
            {pages.map((pageNumber) => {
                const isSelected = selectedPages.includes(pageNumber);

                return (
                    <div
                        key={pageNumber}
                        className="relative transition-all duration-200 group"
                    >
                        <Card
                            className={cn(
                                "overflow-hidden border-2 w-full aspect-3/4 cursor-pointer transition-colors",
                                isSelected
                                    ? "ring-2 ring-primary border-primary bg-zinc-50 dark:bg-zinc-800"
                                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900",
                                "p-0"
                            )}
                            onClick={() => onTogglePage(pageNumber)}
                        >
                            <CardContent className="p-0 h-full flex flex-col">
                                {/* Header: Page Number + Checkbox */}
                                <div className={cn(
                                    "h-8 border-b flex items-center justify-between px-2 shrink-0 transition-colors",
                                    isSelected ? "bg-primary/5 border-primary/20" : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800"
                                )}>
                                    <span className={cn(
                                        "text-xs font-medium truncate select-none",
                                        isSelected ? "text-primary" : "text-zinc-500"
                                    )}>
                                        Página {pageNumber}
                                    </span>
                                    <Checkbox
                                        checked={isSelected}
                                        className={cn(
                                            "w-4 h-4 transition-all",
                                            isSelected ? "data-[state=checked]:bg-primary" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-950"
                                        )}
                                    />
                                </div>

                                {/* Thumbnail Area */}
                                <div className="flex-1 relative flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 overflow-hidden p-2">
                                    <div className="w-full h-full rounded overflow-hidden bg-white dark:bg-zinc-900 relative">
                                        <PdfThumbnail file={file} pageNumber={pageNumber} />

                                        {/* Overlay for selected state */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
