"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, X, Check, RotateCw, RotateCcw, InfoIcon, Copy, StickyNote } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Mapeo de iconos para selección
const ICONS = {
  check: Check,
  x: X,
};

const PdfThumbnail = dynamic(() => import("../pdf-thumbnail").then((mod) => mod.PdfThumbnail), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />,
});

// ============================================
// TIPOS
// ============================================

export interface PdfCardData {
  id: string;
  file: File;
  rotation?: number;
  pageNumber?: number;
  name?: string;
  size?: number;
  pageCount?: number;
  isBlank?: boolean;
}

export interface PdfCardConfig {
  // Funcionalidades habilitadas
  draggable?: boolean;
  selectable?: boolean;
  rotatable?: boolean; // Mantenido por compatibilidad (activa rotate right)
  allowRotateLeft?: boolean;
  allowRotateRight?: boolean;
  allowDuplicate?: boolean;
  allowInsertBlank?: boolean;
  removable?: boolean; // Mantenido por compatibilidad
  allowDelete?: boolean;

  // Información a mostrar
  showFileName?: boolean;
  showPageNumber?: boolean;
  showFileInfo?: boolean;
  showRotationBadge?: boolean;

  // Estilos personalizados
  selectedColorName?: string;
  iconSelectedName?: "check" | "x";
  aspectRatio?: "3/4" | "square" | "16/9";
}

interface PdfCardProps {
  data: PdfCardData;
  config?: PdfCardConfig;
  isSelected?: boolean;
  onToggle?: () => void;
  onRotate?: () => void; // Deprecated: use onRotateRight
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onDuplicate?: () => void;
  onInsertBlank?: () => void;
  onRemove?: () => void;
  customActions?: React.ReactNode;
}

// ============================================
// CONFIGURACIONES PREDEFINIDAS
// ============================================

export const PDF_CARD_PRESETS = {
  // Para Unir PDF (archivos completos)
  merge: {
    draggable: true,
    selectable: false,
    rotatable: false,
    removable: true,
    showFileName: true,
    showFileInfo: true,
    showRotationBadge: false,
  } as PdfCardConfig,

  // Para Eliminar Páginas (con selección)
  delete: {
    draggable: true,
    selectable: true,
    rotatable: false,
    removable: false,
    showPageNumber: true,
    showRotationBadge: true,
    selectedColorName: "red",
    iconSelectedName: "x",
  } as PdfCardConfig,

  // Para Rotar PDF (sin selección)
  rotate: {
    draggable: true,
    selectable: false,
    rotatable: false,
    allowRotateLeft: true,
    allowRotateRight: true,
    allowDelete: true,
    showPageNumber: true,
    showRotationBadge: true,
    removable: false,
  } as PdfCardConfig,

  // Para Extraer Páginas (sin drag, con selección)
  extract: {
    draggable: true,
    selectable: true,
    rotatable: false,
    removable: false,
    showPageNumber: true,
    selectedColorName: "green",
    iconSelectedName: "check",
  } as PdfCardConfig,

  // Para Dividir PDF (sin drag, sin selección, visual)
  split: {
    draggable: false,
    selectable: false,
    rotatable: false,
    removable: false,
    showPageNumber: true,
  } as PdfCardConfig,

  // Para Organizar PDF (todo habilitado)
  organize: {
    draggable: true,
    selectable: true,
    rotatable: false,
    allowRotateLeft: true,
    allowRotateRight: true,
    allowDuplicate: true,
    allowInsertBlank: true,
    allowDelete: true, // Enable individual deletion too as it is useful in organize
    removable: false,
    showPageNumber: true,
    showRotationBadge: true,
  } as PdfCardConfig,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function PdfCard({
  data,
  config = {},
  isSelected = false,
  onToggle,
  onRotate,
  onRotateLeft,
  onRotateRight,
  onDuplicate,
  onInsertBlank,
  onRemove,
  customActions,
}: PdfCardProps) {
  const {
    draggable = true,
    selectable = false,
    rotatable = true,
    allowRotateLeft = false,
    allowRotateRight = false,
    allowDuplicate = false,
    allowInsertBlank = false,
    removable = false,
    allowDelete = false,
    showFileName = false,
    showPageNumber = false,
    showFileInfo = false,
    showRotationBadge = true,
    selectedColorName,
    iconSelectedName,
    aspectRatio = "3/4",
  } = config;

  const rotation = data.rotation || 0;
  const pageNumber = data.pageNumber || 1;

  // DnD Setup (solo si draggable)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: data.id,
    disabled: !draggable
  });

  const style = draggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  } : undefined;

  // Título dinámico
  const title = showFileName && data.name
    ? data.name
    : showPageNumber
      ? `Página ${pageNumber}`
      : "Documento";

  // Subtítulo (info del archivo)
  const subtitle = showFileInfo && data.size
    ? `${(data.size / 1024 / 1024).toFixed(2)} MB${data.pageCount != null ? ` / ${data.pageCount} págs` : ""
    }`
    : undefined;

  // Click handler para selección
  const handleCardClick = () => {
    if (selectable && onToggle) {
      onToggle();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card
        className={cn(
          "w-full overflow-hidden transition-all duration-200 relative border",
          aspectRatio === "3/4" && "aspect-[3/4]",
          aspectRatio === "square" && "aspect-square",
          aspectRatio === "16/9" && "aspect-video",
          isDragging && "shadow-xl ring-2 ring-primary/20 opacity-50",
          isSelected && selectedColorName
            ? `ring-2 ring-${selectedColorName}-500 border-${selectedColorName}-500 bg-${selectedColorName}-50 dark:bg-${selectedColorName}-950/20`
            : isSelected
              ? "ring-2 ring-red-500 border-red-500 bg-red-50 dark:bg-red-950/20"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:shadow-md"
        )}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header */}
          <div
            className={cn(
              "h-8 border-b flex items-center justify-between px-2",
              isSelected && selectedColorName
                ? `bg-${selectedColorName}-50 dark:bg-${selectedColorName}-950/30 border-${selectedColorName}-200 dark:border-${selectedColorName}-900`
                : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 flex-1 min-w-0",
                draggable && "cursor-grab active:cursor-grabbing"
              )}
              {...(draggable ? attributes : {})}
              {...(draggable ? listeners : {})}
            >
              {draggable && <GripVertical className="w-4 h-4 shrink-0 text-zinc-400" />}
              <span className={cn(
                "text-xs font-medium truncate select-none",
                isSelected && selectedColorName
                  ? `text-${selectedColorName}-600 dark:text-${selectedColorName}-400`
                  : "text-zinc-600 dark:text-zinc-400"
              )}>
                {title}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {customActions}
              {selectable && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onToggle}
                  className={cn(
                    "w-4 h-4 border cursor-pointer",
                    selectedColorName === "green" && "data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700",
                    selectedColorName === "red" && "data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white dark:data-[state=checked]:border-red-700 dark:data-[state=checked]:bg-red-700",
                    !selectedColorName && null
                  )}
                />
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div
            className={cn(
              "flex-1 relative flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900 overflow-hidden p-2",
              selectable && "cursor-pointer"
            )}
            onClick={handleCardClick}
          >
            <div
              className={cn(
                "relative transition-all duration-300 ease-in-out origin-center flex flex-col items-center justify-center w-full h-full",
                isSelected && "opacity-20"
              )}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {data.isBlank ? (
                <div className="w-full h-full bg-white dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded flex items-center justify-center text-zinc-400 text-xs">
                  Página en blanco
                </div>
              ) : (
                <PdfThumbnail
                  file={data.file}
                  pageNumber={pageNumber}
                  className="w-full h-full object-contain pointer-events-none"
                />
              )}
            </div>

            {/* Rotation Badge */}
            {showRotationBadge && ((rotation % 360) !== 0) && (
              <div className="absolute top-1 right-1 text-[10px] leading-none font-medium dark:bg-white bg-zinc-800/70 dark:text-primary text-white px-1.5 py-1 rounded-full h-8 w-8 flex items-center justify-center">
                {((rotation % 360) + 360) % 360}°
              </div>
            )}

            {/* Selection Overlay */}
            {isSelected && selectable && (
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none">
                {(() => {
                  const IconComp = iconSelectedName ? ICONS[iconSelectedName] : (selectedColorName === "green" ? Check : X);
                  return <IconComp className={cn(
                    "w-8 h-8 animate-in zoom-in-50 duration-300 drop-shadow-sm",
                    selectedColorName === "green" && "text-green-600",
                    selectedColorName === "red" && "text-red-600",
                    !selectedColorName && "text-red-600"
                  )} />;
                })()}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {(rotatable || allowRotateLeft || allowRotateRight || subtitle || removable || allowDelete) && (
            <div className="h-10 border-t flex items-center justify-between px-2 bg-white dark:bg-zinc-900">

              {/* Left Rotation */}
              {allowRotateLeft && onRotateLeft && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotateLeft();
                  }}
                  title="Rotar Izquierda (-90°)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              )}

              {/* Right Rotation (Standard or granular) */}
              {(allowRotateRight || rotatable) && (onRotateRight || onRotate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Prioritize specific handler, fallback to generic
                    if (onRotateRight) onRotateRight();
                    else if (onRotate) onRotate();
                  }}
                  title="Rotar Derecha (90°)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </Button>
              )}

              {allowInsertBlank && onInsertBlank && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInsertBlank();
                  }}
                  title="Insertar hoja en blanco"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                </Button>
              )}

              {allowDuplicate && onDuplicate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-primary hover:bg-primary/10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  title="Duplicar página"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              )}


              {subtitle && (
                <div className="text-[10px] flex items-center gap-2 text-zinc-400 font-mono">
                  <InfoIcon className="w-3 h-3 inline" />
                  <span className="leading-none">{subtitle}</span>
                </div>
              )}

              {/* Delete Action */}
              {(allowDelete || removable) && onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
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