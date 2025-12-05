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
import { PdfFile } from "@/types";
import { PdfCard } from "./pdf-card";

interface SortableGridProps {
    files: PdfFile[];
    onReorder: (newFiles: PdfFile[]) => void;
    onRotate: (id: string) => void;
    onRemove: (id: string) => void;
}

export function SortableGrid({
    files,
    onReorder,
    onRotate,
    onRemove,
}: SortableGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = files.findIndex((f) => f.id === active.id);
            const newIndex = files.findIndex((f) => f.id === over.id);
            onReorder(arrayMove(files, oldIndex, newIndex));
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={files.map((f) => f.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((file) => (
                        <PdfCard
                            key={file.id}
                            file={file}
                            onRotate={onRotate}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
