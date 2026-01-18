import React, { useMemo, useCallback, memo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { PdfCard, PdfCardConfig } from "./pdf-card";
import { AddPdfCard } from "./add-pdf-card";

// ============================================
// TIPOS MEJORADOS
// ============================================

// Interface mínima que deben cumplir los items
export interface PdfGridItem {
  id: string;
  file: File;
  rotation?: number;
  pageNumber?: number;
  name?: string;
  size?: number;
  pageCount?: number;
  isBlank?: boolean;
  previewUrl?: string;
}

// Helper para extraer datos de card de cualquier tipo
export type ExtractCardData<T> = (item: T) => PdfGridItem;

interface PdfGridProps<T> {
  items: T[];
  config?: PdfCardConfig;
  selectedIds?: string[];
  onReorder?: (newItems: T[]) => void;
  onToggle?: (id: string) => void;
  onRotate?: (id: string) => void;
  onRotateLeft?: (id: string) => void;
  onRotateRight?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onInsertBlank?: (id: string) => void;
  onRemove?: (id: string) => void;
  renderCardActions?: (item: T) => React.ReactNode;
  extractCardData?: ExtractCardData<T>; // ✨ NUEVO: Función para extraer datos
  className?: string;
  // Add PDF Card props
  showAddCard?: boolean;
  onAddFiles?: (files: File[]) => void;
  addCardText?: string;
  addCardSubtext?: string;
  addCardDisabled?: boolean;
  addCardAccept?: string;
  layout?: "grid" | "list";
}

export const PdfGrid = memo(function PdfGrid<T extends { id: string }>({
  items,
  config,
  selectedIds = [],
  onReorder,
  onToggle,
  onRotate,
  onRotateLeft,
  onRotateRight,
  onDuplicate,
  onInsertBlank,
  onRemove,
  renderCardActions,
  extractCardData,
  className,
  showAddCard = false,
  onAddFiles,
  addCardText,
  addCardSubtext,
  addCardDisabled = false,
  addCardAccept,
  layout = "grid",
}: PdfGridProps<T>) {
  const draggable = config?.draggable !== false;

  // Merge layout into config
  const finalConfig: PdfCardConfig = { ...config, layout };

  // Calculate generic class name if not provided
  const finalClassName = className || (layout === "list"
    ? "flex flex-col gap-3 w-full mx-auto"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }, [items, onReorder]);

  const getCardData = (item: T): PdfGridItem => {
    if (extractCardData) {
      return extractCardData(item);
    }

    return item as unknown as PdfGridItem;
  };

  const gridContent = (
    <div className={finalClassName}>
      {showAddCard && onAddFiles && (
        <AddPdfCard
          onFilesAdded={onAddFiles}
          text={addCardText}
          subtext={addCardSubtext}
          disabled={addCardDisabled}
          accept={addCardAccept}
          layout={layout}
        />
      )}
      {items.map((item) => (
        <MemoizedPdfGridCard
          key={item.id}
          item={item}
          data={getCardData(item)}
          config={finalConfig}
          isSelected={selectedIds.includes(item.id)}
          onToggle={onToggle}
          onRotate={onRotate}
          onRotateLeft={onRotateLeft}
          onRotateRight={onRotateRight}
          onDuplicate={onDuplicate}
          onInsertBlank={onInsertBlank}
          onRemove={onRemove}
          renderCardActions={renderCardActions}
        />
      ))}

    </div>
  );

  // Si draggable está deshabilitado, retornar sin DnD
  if (!draggable || !onReorder) {
    return gridContent;
  }

  // Con DnD
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        {gridContent}
      </SortableContext>
    </DndContext>
  );
}) as <T extends { id: string }>(props: PdfGridProps<T>) => React.ReactElement;

// ============================================
// COMPONENTE INTERNO MEMOIZADO
// ============================================

interface MemoizedPdfGridCardProps<T> {
  item: T;
  data: PdfGridItem;
  config: PdfCardConfig;
  isSelected: boolean;
  onToggle?: (id: string) => void;
  onRotate?: (id: string) => void;
  onRotateLeft?: (id: string) => void;
  onRotateRight?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onInsertBlank?: (id: string) => void;
  onRemove?: (id: string) => void;
  renderCardActions?: (item: T) => React.ReactNode;
}

function PdfGridCard<T extends { id: string }>({
  item,
  data,
  config,
  isSelected,
  onToggle,
  onRotate,
  onRotateLeft,
  onRotateRight,
  onDuplicate,
  onInsertBlank,
  onRemove,
  renderCardActions,
}: MemoizedPdfGridCardProps<T>) {
  const handleToggle = useMemo(() => onToggle ? () => onToggle(item.id) : undefined, [onToggle, item.id]);
  const handleRotate = useMemo(() => onRotate ? () => onRotate(item.id) : undefined, [onRotate, item.id]);
  const handleRotateLeft = useMemo(() => onRotateLeft ? () => onRotateLeft(item.id) : undefined, [onRotateLeft, item.id]);
  const handleRotateRight = useMemo(() => onRotateRight ? () => onRotateRight(item.id) : undefined, [onRotateRight, item.id]);
  const handleDuplicate = useMemo(() => onDuplicate ? () => onDuplicate(item.id) : undefined, [onDuplicate, item.id]);
  const handleInsertBlank = useMemo(() => onInsertBlank ? () => onInsertBlank(item.id) : undefined, [onInsertBlank, item.id]);
  const handleRemove = useMemo(() => onRemove ? () => onRemove(item.id) : undefined, [onRemove, item.id]);

  return (
    <PdfCard
      data={data}
      config={config}
      isSelected={isSelected}
      onToggle={handleToggle}
      onRotate={handleRotate}
      onRotateLeft={handleRotateLeft}
      onRotateRight={handleRotateRight}
      onDuplicate={handleDuplicate}
      onInsertBlank={handleInsertBlank}
      onRemove={handleRemove}
      customActions={renderCardActions?.(item)}
    />
  );
}

const MemoizedPdfGridCard = memo(PdfGridCard) as typeof PdfGridCard;