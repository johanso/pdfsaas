"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, X, Check, RotateCw, RotateCcw, InfoIcon, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import BootstrapIcon from "../bootstrapIcon";
import { OfficeThumbnail } from "../office-thumbnail";

// Mapeo de iconos para selección
const ICONS = {
  check: Check,
  x: X,
};

import { ThumbnailSkeleton } from "./thumbnail-skeleton";

const PdfThumbnail = dynamic(() => import("../pdf-thumbnail").then((mod) => mod.PdfThumbnail), {
  ssr: false,
  loading: () => <ThumbnailSkeleton />,
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
  previewUrl?: string; // URL de la imagen para vista previa directa (evita usar PdfThumbnail)
}

export interface PdfCardConfig {
  // Layout mode
  layout?: "grid" | "list";

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
    layout: "list",
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
    rotatable: true,
    allowRotateLeft: true,
    allowRotateRight: true,
    allowDuplicate: true,
    allowInsertBlank: true,
    allowDelete: true, // Enable individual deletion too as it is useful in organize
    removable: true,
    showPageNumber: true,
    showRotationBadge: true,
    selectedColorName: "green",
    iconSelectedName: "check",
  } as PdfCardConfig,

  imageToPdf: {
    draggable: true,
    selectable: true,
    rotatable: false,
    removable: false,
    showFileName: true,
    showPageNumber: false,
    showRotationBadge: false,
    selectedColorName: "green",
    iconSelectedName: "check",
  } as PdfCardConfig,

  pdftoImg: {
    draggable: false,
    selectable: true,
    rotatable: false,
    removable: false,
    showPageNumber: true,
    selectedColorName: "green",
    iconSelectedName: "check",
  } as PdfCardConfig,
  

  // Para OCR PDF (archivos escaneados)
  ocr: {
    draggable: true,
    selectable: false,
    rotatable: false,
    removable: true,
    showFileName: false,
    showFileInfo: false,
    showPageNumber: true,
    showRotationBadge: false,
  } as PdfCardConfig,

  // Para Comprimir PDF
  compress: {
    layout: "list",
    draggable: false,
    selectable: false,
    rotatable: false,
    removable: true,
    showFileName: true,
    showFileInfo: true,
    showPageNumber: false,
    showRotationBadge: false,
  } as PdfCardConfig,

};

import { FileText } from "lucide-react";

import { memo } from "react";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const PdfCard = memo(function PdfCard({
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
    layout = "grid",
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

  // Detectar si es un archivo de Office
  const isOfficeFile = () => {
    const fileName = data.file.name.toLowerCase();
    return fileName.endsWith('.doc') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.ppt') ||
      fileName.endsWith('.pptx');
  };

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
    ? `${(data.size / 1024 / 1024).toFixed(2)} MB${data.pageCount != null ? ` / ${data.pageCount} págs` : ""}`
    : undefined;

  // Click handler para selección
  const handleCardClick = () => {
    if (selectable && onToggle) {
      onToggle();
    }
  };

  // --- RENDER LIST LAYOUT ---
  if (layout === "list") {
    return (
      <div ref={setNodeRef} style={style} className={cn("relative group w-full", isDragging && "z-10")}>
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-md border bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200",
          isDragging ? "ring-2 ring-primary/20 opacity-90 scale-[1.01]" : "hover:border-primary/30 hover:shadow-md",
          "border-zinc-200 dark:border-zinc-800"
        )}>
          {/* Drag Handle */}
          {draggable && (
            <div
              className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 p-1"
              style={{ touchAction: "none" }}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-5 h-5" />
            </div>
          )}

          {/* Icon */}
          <div className={cn(
            "shrink-0 w-10 h-10 mr-2 rounded-lg flex items-center justify-center border",
            isOfficeFile()
              ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30"
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
          )}>
            {isOfficeFile() ? (
              <OfficeThumbnail
                file={data.file}
                className="w-full h-full rounded"
              />
            ) : (
              <FileText className="w-6 h-6" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={title}>
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {(allowDelete || removable) && onRemove && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER GRID LAYOUT (existing) ---
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card
        className={cn(
          "w-full overflow-hidden transition-all duration-200 relative border",
          aspectRatio === "3/4" && "aspect-3/4",
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
              "h-8 border-b flex items-center justify-between px-3",
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
              style={draggable ? { touchAction: "none" } : undefined}
              {...(draggable ? attributes : {})}
              {...(draggable ? listeners : {})}
            >
              {draggable && <GripVertical className="w-4 h-4 shrink-0 text-zinc-400" />}
              <span className={cn(
                "text-xs font-medium truncate select-none pr-1",
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
                    "w-4 h-4 border border-zinc-300 cursor-pointer bg-white shadow-none rounded-full",
                    selectedColorName === "green" && "data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700",
                    selectedColorName === "red" && "data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white dark:data-[state=checked]:border-red-700 dark:data-[state=checked]:bg-red-700",
                    !selectedColorName && 'data-[state=checked]:border-zinc-400 data-[state=checked]:bg-zinc-100 data-[state=checked]:text-white dark:data-[state=checked]:border-zinc-700 dark:data-[state=checked]:bg-zinc-700'
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
              ) : isOfficeFile() ? (
                <OfficeThumbnail
                  file={data.file}
                  className="w-full h-full rounded"
                />
              ) : data.previewUrl ? (
                <img
                  src={data.previewUrl}
                  alt={data.name || "Preview"}
                  className="w-full h-full object-contain pointer-events-none rounded select-none"
                  draggable={false}
                />
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
              <div className="absolute top-1 right-1 text-[10px] leading-none font-medium bg-zinc-800/70 dark:bg-zinc-900/70 text-white px-1.5 py-1 rounded-full h-8 w-8 flex items-center justify-center">
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
                  <BootstrapIcon name="file-plus" size={20} />
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
});