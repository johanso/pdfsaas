import { PageData } from "@/types";
import { BasePdfCard } from "./pdf-card-base";

interface PdfPageCardProps {
  page: PageData;
  isSelected: boolean;
  onToggle: (id: string) => void;
  actions?: React.ReactNode;
  hideSelection?: boolean;
  selectedClassName?: string;
  selectedHeaderClassName?: string;
  selectedTitleClassName?: string;
  selectionIcon?: React.ReactNode;
  selectedCheckboxColor?: string;
  isDraggable?: boolean;
}

export function PdfPageCard({
  page,
  isSelected,
  onToggle,
  actions,
  hideSelection,
  selectedClassName,
  selectedHeaderClassName,
  selectedCheckboxColor,
  selectedTitleClassName,
  selectionIcon,
  isDraggable,
}: PdfPageCardProps) {
  return (
    <BasePdfCard
      id={page.id}
      file={page.file}
      rotation={page.rotation}
      pageNumber={page.originalIndex}
      title={`Página ${page.originalIndex}`}
      isSelected={isSelected}
      onToggle={() => onToggle(page.id)}
      showCheckbox={!hideSelection}
      customActions={actions}
      selectedClassName={selectedClassName}
      selectedHeaderClassName={selectedHeaderClassName}
      selectedTitleClassName={selectedTitleClassName}
      selectedCheckboxColor={selectedCheckboxColor}
      selectionIcon={selectionIcon}
      isDraggable={isDraggable}
    />
  );
}