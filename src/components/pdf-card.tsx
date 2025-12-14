import { PdfFile } from "@/types";
import { BasePdfCard } from "./pdf-card-base";

interface PdfCardProps {
  file: PdfFile;
  onRotate?: (id: string) => void;
  onRemove: (id: string) => void;
  showRotate?: boolean;
}

export function PdfCard({ file, onRotate, onRemove, showRotate = true }: PdfCardProps) {
  const subtitle = `${(file.file.size / 1024 / 1024).toFixed(2)} MB${file.pageCount != null ? ` / ${file.pageCount} págs` : ""
    }`;

  return (
    <BasePdfCard
      id={file.id}
      file={file.file}
      rotation={file.rotation}
      title={file.name}
      subtitle={subtitle}
      onRemove={() => onRemove(file.id)}
      onRotate={onRotate ? () => onRotate(file.id) : undefined}
      showRotate={showRotate}
    />
  );
}