"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, X } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamic import for the thumbnail to prevent SSR issues
const PdfThumbnail = dynamic(() => import("./pdf-thumbnail").then((mod) => mod.PdfThumbnail), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />,
});

interface PageData {
    id: string;
    originalIndex: number; // 1-based index from the PDF
    rotation: number;
    file: File;
}

interface PdfPageCardProps {
    page: PageData;
    isSelected: boolean;
    onToggle: (id: string) => void;
}

export function PdfPageCard({ page, isSelected, onToggle }: PdfPageCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <Card
                className={cn(
                    "w-full aspect-3/4 overflow-hidden transition-all duration-200 relative border-2",
                    isDragging && "shadow-xl ring-2 ring-primary/20 opacity-50",
                    isSelected
                        ? "ring-2 ring-red-500 border-red-500 bg-red-50 dark:bg-red-950/20"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                )}
            >
                <CardContent className="p-0 h-full flex flex-col">
                    {/* Header: Drag Handle + Page Number + Checkbox */}
                    <div
                        className={cn(
                            "h-8 border-b flex items-center justify-between px-2",
                            isSelected
                                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                                : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800"
                        )}
                    >
                        <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
                            <GripVertical className="w-4 h-4 shrink-0 text-zinc-400" />
                            <span className={cn(
                                "text-xs font-medium truncate select-none",
                                isSelected ? "text-red-600 dark:text-red-400" : "text-zinc-500"
                            )}>
                                Página {page.originalIndex}
                            </span>
                        </div>
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggle(page.id)}
                            className={cn(
                                "w-4 h-4 border cursor-pointer",
                                isSelected
                                    ? "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                    : "border-zinc-300 dark:border-zinc-600"
                            )}
                        />
                    </div>

                    {/* Preview Area */}
                    <div
                        className="flex-1 relative flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 overflow-hidden p-2 cursor-pointer"
                        onClick={() => onToggle(page.id)}
                    >
                        <div
                            className={cn(
                                "relative transition-all duration-300 ease-in-out origin-center flex flex-col items-center justify-center w-full h-full",
                                isSelected && "opacity-50"
                            )}
                            style={{ transform: `rotate(${page.rotation}deg)` }}
                        >
                            <PdfThumbnail
                                file={page.file}
                                pageNumber={page.originalIndex}
                                className="w-full h-full object-contain pointer-events-none"
                            />
                        </div>

                        {/* Rotation Badge */}
                        {page.rotation > 0 && (
                            <div className="absolute top-2 right-2 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                                {page.rotation}°
                            </div>
                        )}

                        {/* Deletion Overlay */}
                        <div className={cn(
                            "absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none",
                            isSelected ? "opacity-100" : "opacity-0"
                        )}>
                            {isSelected && <X className="w-8 h-8 text-red-600 drop-shadow-sm" />}
                        </div>
                    </div>


                </CardContent>
            </Card>
        </div>
    );
}
