"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCw, GripVertical, Trash2 } from "lucide-react";
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
    onRotate: (id: string) => void;
}

export function PdfPageCard({ page, isSelected, onToggle, onRotate }: PdfPageCardProps) {
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
                    "w-full aspect-[3/4] overflow-hidden transition-all duration-200 relative bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
                    isDragging && "shadow-xl ring-2 ring-primary/20 opacity-50",
                    isSelected && "ring-2 ring-red-500 border-red-500/50"
                )}
            >
                <CardContent className="p-0 h-full flex flex-col">
                    {/* Header: Drag Handle + Page Number */}
                    <div
                        className="h-8 bg-zinc-50 dark:bg-zinc-800/50 border-b flex items-center px-2 cursor-grab active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-zinc-500 font-medium truncate ml-2 select-none">
                            Página {page.originalIndex}
                        </span>
                    </div>

                    {/* Preview Area */}
                    <div
                        className="flex-1 relative flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 overflow-hidden p-2 cursor-pointer"
                        onClick={() => onToggle(page.id)}
                    >
                        <div
                            className="relative transition-transform duration-300 ease-in-out origin-center flex flex-col items-center justify-center w-full h-full"
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
                            isSelected ? "bg-red-500/10 opacity-100" : "opacity-0"
                        )}>
                            {isSelected && <Trash2 className="w-8 h-8 text-red-600 drop-shadow-sm" />}
                        </div>
                    </div>

                    {/* Footer: Rotate + Checkbox */}
                    <div className="h-10 border-t flex items-center justify-between px-3 bg-white dark:bg-zinc-900">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRotate(page.id);
                            }}
                            title="Rotate 90°"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                        </Button>

                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggle(page.id)}
                            className={cn(
                                "data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                            )}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
