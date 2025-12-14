import { PageData } from "@/types";
import { PdfPageCard } from "./pdf-page-card";
import { SortableGridBase } from "./sortable-grid-base";

interface SortablePageGridProps {
  pages: PageData[];
  selectedIds: string[];
  onReorder: (newPages: PageData[]) => void;
  onToggle: (id: string) => void;
  renderCardActions?: (page: PageData) => React.ReactNode;
}

export function SortablePageGrid({
  pages,
  selectedIds,
  onReorder,
  onToggle,
  renderCardActions,
}: SortablePageGridProps) {
  return (
    <SortableGridBase
      items={pages}
      onReorder={onReorder}
      getItemId={(page) => page.id}
      renderItem={(page) => (
        <PdfPageCard
          page={page}
          isSelected={selectedIds.includes(page.id)}
          onToggle={onToggle}
          actions={renderCardActions?.(page)}
          hideSelection={!!renderCardActions}
        />
      )}
    />
  );
}