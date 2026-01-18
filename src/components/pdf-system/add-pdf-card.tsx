"use client";

import { useState, useRef, DragEvent, ChangeEvent, memo } from "react";
import { Plus, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AddPdfCardProps {
  onFilesAdded: (files: File[]) => void;
  className?: string;
  text?: string;
  subtext?: string;
  aspectRatio?: "3/4" | "square" | "16/9";
  disabled?: boolean;
  accept?: string;
}

export const AddPdfCard = memo(function AddPdfCard({
  onFilesAdded,
  className,
  text = "Añadir PDF",
  subtext = "Arrastra o haz clic",
  aspectRatio = "3/4",
  disabled = false,
  accept = "application/pdf",
  layout = "grid",
}: AddPdfCardProps & { layout?: "grid" | "list" }) {
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
      onFilesAdded(fileList);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
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

  if (layout === "list") {
    return (
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative overflow-hidden transition-all duration-200 cursor-pointer border-2 border-dashed w-full",
          "h-16 flex items-center justify-center", // Fixed height for list
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01] shadow-md"
            : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-primary/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
          disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
          className
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={true}
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
        />
        <div className="flex items-center gap-3 pointer-events-none">
          <div className={cn(
            "p-1.5 rounded-full transition-colors",
            isDragging ? "bg-primary text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
          )}>
            {isDragging ? <Upload className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <p className={cn(
            "text-sm font-medium transition-colors",
            isDragging ? "text-primary" : "text-zinc-600 dark:text-zinc-400"
          )}>
            {text}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden transition-all duration-200 cursor-pointer border-2 border-dashed",
        aspectRatio === "3/4" && "aspect-3/4",
        aspectRatio === "square" && "aspect-square",
        aspectRatio === "16/9" && "aspect-video",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02] shadow-md"
          : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-primary/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:scale-100",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={true}
        accept={accept}
        onChange={handleFileInput}
        disabled={disabled}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
            isDragging
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-primary text-white hover:bg-primary/80"
          )}
        >
          {isDragging ? (
            <Upload className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </div>
        <div className="text-center space-y-1">
          <p
            className={cn(
              "text-sm font-semibold transition-colors",
              isDragging
                ? "text-primary"
                : "text-zinc-700 dark:text-zinc-300"
            )}
          >
            {text}
          </p>
          <p
            className={cn(
              "text-xs transition-colors",
              isDragging
                ? "text-primary/70"
                : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            {subtext}
          </p>
        </div>
      </div>
    </Card>
  );
});
