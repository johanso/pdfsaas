"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, X, RotateCw, InfoIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const PdfThumbnail = dynamic(() => import("./pdf-thumbnail").then((mod) => mod.PdfThumbnail), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />,
});

interface BasePdfCardProps {
  id: string;
  file: File;
  rotation?: number;
  pageNumber?: number;

  // Display
  title: string;
  subtitle?: string;

  // Selection (optional)
  isSelected?: boolean;
  onToggle?: () => void;
  showCheckbox?: boolean;

  // Actions
  onRemove?: () => void;
  onRotate?: () => void;
  showRotate?: boolean;
  customActions?: React.ReactNode;

  // Styling
  selectedClassName?: string;
  selectedHeaderClassName?: string;
  selectedTitleClassName?: string;
  selectedCheckboxColor?: string;
  selectionIcon?: React.ReactNode;
  isDraggable?: boolean;
}

export function BasePdfCard({
  id,
  file,
  rotation = 0,
  pageNumber = 1,
  title,
  subtitle,
  isSelected = false,
  onToggle,
  showCheckbox = false,
  onRemove,
  onRotate,
  showRotate = false,
  customActions,
  selectedClassName,
  selectedHeaderClassName,
  selectedCheckboxColor,
  selectedTitleClassName,
  selectionIcon,
  isDraggable = true,
}: BasePdfCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const handleCardClick = () => {
    if (onToggle && showCheckbox) {
      onToggle();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card
        className={cn(
          "w-full aspect-3/4 overflow-hidden transition-all duration-200 relative border",
          isDragging && "shadow-xl ring-2 ring-primary/20 opacity-50",
          isSelected
            ? (selectedClassName || "ring-2 ring-red-500 border-red-500 bg-red-50 dark:bg-red-950/20")
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-md"
        )}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header */}
          <div
            className={cn(
              "h-8 border-b flex items-center justify-between px-2",
              isSelected
                ? (selectedHeaderClassName || "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900")
                : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800"
            )}
          >
            <div
              className={cn("flex items-center gap-2 flex-1 min-w-0", isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
              {...attributes}
              {...(isDraggable ? listeners : {})}
            >
              {isDraggable && <GripVertical className="w-4 h-4 shrink-0 text-zinc-400" />}
              <span className={cn(
                "text-xs font-medium truncate select-none",
                isSelected
                  ? (selectedTitleClassName || "text-red-600 dark:text-red-400")
                  : "text-zinc-500"
              )}>
                {title}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {customActions}
              {showCheckbox && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onToggle}
                  className={cn(
                    "w-4 h-4 border cursor-pointer",
                    isSelected
                      ?
                      selectedCheckboxColor ? `border-${selectedCheckboxColor} bg-${selectedCheckboxColor} data-[state=checked]:bg-${selectedCheckboxColor} data-[state=checked]:border-${selectedCheckboxColor}` : "border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      : "border-zinc-300 dark:border-zinc-600"
                  )}
                />
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div
            className={cn(
              "flex-1 relative flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 overflow-hidden p-2",
              showCheckbox && "cursor-pointer"
            )}
            onClick={handleCardClick}
          >
            <div
              className={cn(
                "relative transition-all duration-300 ease-in-out origin-center flex flex-col items-center justify-center w-full h-full",
                isSelected && "opacity-50"
              )}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <PdfThumbnail
                file={file}
                pageNumber={pageNumber}
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>

            {/* Rotation Badge */}
            {rotation > 0 && (
              <div className="absolute top-2 right-2 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                {rotation}°
              </div>
            )}

            {/* Selection Overlay */}
            {isSelected && showCheckbox && (
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
                {selectionIcon || <X className="w-8 h-8 text-red-600 drop-shadow-sm" />}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {(showRotate || subtitle || onRemove) && (
            <div className="h-10 border-t flex items-center justify-between px-2 bg-white dark:bg-zinc-900">
              {showRotate && onRotate ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={onRotate}
                  title="Rotar 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <div />
              )}

              {subtitle && (
                <div className="text-[10px] flex items-center gap-2 text-zinc-400 font-mono">
                  <InfoIcon className="w-3 h-3 inline" />
                  <span className="leading-none">{subtitle}</span>
                </div>
              )}

              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={onRemove}
                  title="Eliminar"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}