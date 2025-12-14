"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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

interface SortableGridBaseProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  getItemId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

export function SortableGridBase<T>({
  items,
  onReorder,
  getItemId,
  renderItem,
  className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
}: SortableGridBaseProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
      const newIndex = items.findIndex((item) => getItemId(item) === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(getItemId)} strategy={rectSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <div key={getItemId(item)}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}