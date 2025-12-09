import { PdfFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { RotateCw, X, GripVertical, InfoIcon } from "lucide-react";

const PdfThumbnail = dynamic(() => import("./pdf-thumbnail").then((mod) => mod.PdfThumbnail), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />,
});
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface PdfCardProps {
    file: PdfFile;
    onRotate?: (id: string) => void;
    onRemove: (id: string) => void;
    showRotate?: boolean;
}

export function PdfCard({ file, onRotate, onRemove, showRotate = true }: PdfCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <Card
                className={cn(
                    "w-full aspect-[3/4] overflow-hidden transition-shadow relative bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
                    isDragging ? "shadow-xl ring-2 ring-primary/20 opacity-50" : "hover:shadow-md"
                )}
            >
                <CardContent className="p-0 h-full flex flex-col">
                    {/* Header / Drag Handle */}
                    <div
                        className="h-8 bg-zinc-50 dark:bg-zinc-800/50 border-b flex items-center px-2 cursor-grab active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="w-4 h-4 shrink-0 text-zinc-400" />
                        <span className="text-xs text-zinc-500 font-medium truncate ml-2 select-none">
                            {file.name}
                        </span>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 relative flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 overflow-hidden p-2">
                        <div
                            className="relative transition-transform duration-300 ease-in-out origin-center flex flex-col items-center justify-center w-full h-full"
                            style={{ transform: `rotate(${file.rotation}deg)` }}
                        >
                            <PdfThumbnail file={file.file} className="w-full h-full object-contain pointer-events-none" />
                        </div>

                        {/* Rotation Badge */}
                        {file.rotation > 0 && (
                            <div className="absolute top-2 right-2 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                                {file.rotation}°
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="h-10 border-t flex items-center justify-between px-2 bg-white dark:bg-zinc-900">
                        {showRotate && onRotate ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                                onClick={() => onRotate(file.id)}
                                title="Rotate 90°"
                            >
                                <RotateCw className="w-3.5 h-3.5 cursor-pointer" />
                            </Button>
                        ) : (
                            null
                        )}

                        <div className="text-[10px] flex items-center gap-2 text-zinc-400 font-mono">
                            <InfoIcon className="w-3 h-3 cursor-pointer inline" />
                            <span className="leading-none">
                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                {file.pageCount != null && <span> / {file.pageCount} págs</span>}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => onRemove(file.id)}
                            title="Remove file"
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
