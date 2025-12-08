"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
    onFilesSelected: (files: File[]) => void;
    multiple?: boolean;
    accept?: string;
    title?: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}

export function Dropzone({
    onFilesSelected,
    multiple = false,
    accept = "application/pdf",
    title = multiple ? "Sube tus archivos PDF" : "Sube tu archivo PDF",
    description = multiple
        ? "Arrastra y suelta tus archivos aquí o haz clic para explorar. Puedes seleccionar múltiples archivos."
        : "Arrastra y suelta tu archivo aquí o haz clic para explorar.",
    className,
    disabled = false
}: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (disabled) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const fileList = Array.from(e.dataTransfer.files);

            // Should we filter by accept type? 
            // The browser input does this, but drag and drop doesn't automatically.
            // Let's rely on the parent to validate for now, or minimal check if accept is specific.
            // But usually handling all files and letting parent error/toast is better UX than silently ignoring.

            onFilesSelected(fileList);
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
        // Reset value to allow selecting the same file again if needed
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleClick = () => {
        if (disabled) return;
        inputRef.current?.click();
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={cn(
                "border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[320px]",
                isDragging
                    ? "border-primary bg-primary/5"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50",
                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                className
            )}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={multiple}
                accept={accept}
                onChange={handleFileInput}
                disabled={disabled}
            />

            <div className={cn(
                "p-4 rounded-full mb-6 shadow-sm",
                isDragging ? "bg-white dark:bg-zinc-800 scale-110 transition-transform" : "bg-white dark:bg-zinc-800"
            )}>
                <FileUp className={cn(
                    "w-10 h-10",
                    isDragging ? "text-primary" : "text-primary/80"
                )} />
            </div>

            <h3 className="text-xl font-bold mb-2 text-center">{title}</h3>
            <p className="text-zinc-500 text-center max-w-sm">
                {description}
            </p>
        </div>
    );
}
