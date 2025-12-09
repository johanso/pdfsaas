"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";

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

        // Alternate colors for visual distinction - Expanded palette with higher opacity
        const colors = [
            "bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-700",
            "bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-700",
            "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-700",
            "bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-700",
            "bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-700",
            "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-700",
            "bg-teal-100 dark:bg-teal-900/40 border-teal-400 dark:border-teal-700",
            "bg-pink-100 dark:bg-pink-900/40 border-pink-400 dark:border-pink-700",
            "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-700",
            "bg-cyan-100 dark:bg-cyan-900/40 border-cyan-400 dark:border-cyan-700",
            "bg-lime-100 dark:bg-lime-900/40 border-lime-400 dark:border-lime-700",
            "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-700",
        ];
        return colors[groupIndex % colors.length];
    };

    return (
        <div className="flex flex-wrap gap-y-8 gap-x-0 justify-center pb-20 select-none">
            {pages.map((pageNumber) => {
                const isSplit = ranges.includes(pageNumber);
                const isLast = pageNumber === numPages;

                return (
                    <div key={pageNumber} className="flex items-center">
                        {/* Page Card */}
                        <div
                            className={cn(
                                "relative w-[140px] rounded-lg transition-all duration-200",
                            )}
                        >
                            <Card
                                className={cn(
                                    "overflow-hidden border-3 w-full",
                                    getGroupColor(pageNumber),
                                    // Remove padding from card to allow full content control
                                    "p-0"
                                )}
                            >
                                <CardContent className="p-0">
                                    {/* Header: Page Number */}
                                    <div className="h-8 bg-zinc-50 dark:bg-zinc-800/50 border-b flex items-center justify-between px-2">
                                        <span className="text-xs text-zinc-500 font-medium truncate select-none">
                                            Página {pageNumber}
                                        </span>
                                    </div>

                                    {/* Thumbnail Area */}
                                    <div className="relative aspect-[3/4] p-2 bg-white dark:bg-zinc-950/50">
                                        <div className="w-full h-full rounded shadow-sm overflow-hidden">
                                            <PdfThumbnail file={file} pageNumber={pageNumber} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Gap / Splitter (Only if not last page) */}
                        {!isLast && (
                            <div className="relative flex flex-col items-center justify-center px-1 w-[30px] h-full group z-10">
                                {mode === "ranges" ? (
                                    <>
                                        {/* Visual Line */}
                                        <div className={cn(
                                            "absolute h-full w-0.5 transition-colors",
                                            isSplit ? "bg-dashed-red" : "bg-transparent group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                                        )} />

                                        {/* Scissor Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "w-6 h-6 rounded-full border shadow-sm transition-all z-20 absolute",
                                                isSplit
                                                    ? "bg-red-500 text-white border-red-600 hover:bg-red-600 hover:text-white"
                                                    : "bg-white dark:bg-zinc-800 text-zinc-300 border-dashed border-zinc-300 dark:border-zinc-700 hover:text-zinc-600 hover:border-zinc-400 dark:hover:text-zinc-200"
                                            )}
                                            onClick={() => onRangeClick(pageNumber)}
                                        >
                                            <Scissors className={cn("w-3 h-3", isSplit && "text-white")} />
                                        </Button>
                                    </>
                                ) : (
                                    // Valid spacer for other modes to keep grid aligned
                                    <div className="w-1" />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
