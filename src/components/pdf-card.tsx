import { PdfFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCw, X, GripVertical, FileCode } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface PdfCardProps {
    file: PdfFile;
    onRotate: (id: string) => void;
    onRemove: (id: string) => void;
}

export function PdfCard({ file, onRotate, onRemove }: PdfCardProps) {
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
                        <GripVertical className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs text-zinc-500 font-medium truncate ml-2 select-none">
                            {file.name}
                        </span>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 relative flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 overflow-hidden p-4">
                        <div
                            className="relative transition-transform duration-300 ease-in-out origin-center flex flex-col items-center gap-2"
                            style={{ transform: `rotate(${file.rotation}deg)` }}
                        >
                            <FileCode className="w-12 h-12 text-zinc-400" />
                            {/* Visual representation of pages could go here later */}
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10"
                            onClick={() => onRotate(file.id)}
                            title="Rotate 90°"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                        </Button>

                        <div className="text-[10px] text-zinc-400 font-mono">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-destructive hover:bg-destructive/10"
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
