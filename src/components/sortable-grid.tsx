import { PdfFile } from "@/types";
import { PdfCard } from "./pdf-card";
import { SortableGridBase } from "./sortable-grid-base";

interface SortableGridProps {
  files: PdfFile[];
  onReorder: (newFiles: PdfFile[]) => void;
  onRotate?: (id: string) => void;
  onRemove: (id: string) => void;
  showRotate?: boolean;
}

export function SortableGrid({
  files,
  onReorder,
  onRotate,
  onRemove,
  showRotate = true,
}: SortableGridProps) {
  return (
    <SortableGridBase
      items={files}
      onReorder={onReorder}
      getItemId={(file) => file.id}
      renderItem={(file) => (
        <PdfCard
          file={file}
          onRotate={onRotate}
          onRemove={onRemove}
          showRotate={showRotate}
        />
      )}
    />
  );
}