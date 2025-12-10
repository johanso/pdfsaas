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
import { PdfPageCard } from "./pdf-page-card";

interface PageData {
    id: string;
    originalIndex: number;
    rotation: number;
    file: File;
}

interface SortablePageGridProps {
    pages: PageData[];
    selectedIds: string[];
    onReorder: (newPages: PageData[]) => void;
    onToggle: (id: string) => void;
}

export function SortablePageGrid({
    pages,
    selectedIds,
    onReorder,
    onToggle,
}: SortablePageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = pages.findIndex((p) => p.id === active.id);
            const newIndex = pages.findIndex((p) => p.id === over.id);
            onReorder(arrayMove(pages, oldIndex, newIndex));
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {pages.map((page) => (
                        <PdfPageCard
                            key={page.id}
                            page={page}
                            isSelected={selectedIds.includes(page.id)}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
