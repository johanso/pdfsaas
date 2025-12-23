"use client";

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
}

export function PdfGrid<T extends { id: string }>({
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
  className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
}: PdfGridProps<T>) {
  const draggable = config?.draggable !== false;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Activation constraint for mouse: 5px movement
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Activation constraint for touch: 250ms press to start dragging
      // This allows the user to scroll without accidentally dragging
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  const getCardData = (item: T): PdfGridItem => {
    if (extractCardData) {
      return extractCardData(item);
    }

    return item as unknown as PdfGridItem;
  };

  const gridContent = (
    <div className={className}>
      {items.map((item) => {
        const cardData = getCardData(item);

        return (
          <PdfCard
            key={item.id}
            data={cardData}
            config={config}
            isSelected={selectedIds.includes(item.id)}
            onToggle={onToggle ? () => onToggle(item.id) : undefined}
            onRotate={onRotate ? () => onRotate(item.id) : undefined}
            onRotateLeft={onRotateLeft ? () => onRotateLeft(item.id) : undefined}
            onRotateRight={onRotateRight ? () => onRotateRight(item.id) : undefined}
            onDuplicate={onDuplicate ? () => onDuplicate(item.id) : undefined}
            onInsertBlank={onInsertBlank ? () => onInsertBlank(item.id) : undefined}
            onRemove={onRemove ? () => onRemove(item.id) : undefined}
            customActions={renderCardActions?.(item)}
          />
        );
      })}
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
}