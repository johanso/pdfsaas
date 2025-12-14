"use client";


import { PdfPageCard } from "@/components/pdf-page-card";
import { Check } from "lucide-react";

interface PdfPageGridProps {
  file: File;
  numPages: number;
  selectedPages: number[]; // Indices of selected pages (1-based)
  onTogglePage: (pageIndex: number) => void;
}

export function PdfPageGrid({
  file,
  numPages,
  selectedPages,
  onTogglePage,
}: PdfPageGridProps) {
  // Generate array of page numbers 1..N
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 select-none">
      {pages.map((pageNumber) => {
        const isSelected = selectedPages.includes(pageNumber);

        return (
          <div
            key={pageNumber}
            className="relative transition-all duration-200 group"
          >
            <PdfPageCard
              page={{
                id: pageNumber.toString(),
                file: file,
                originalIndex: pageNumber,
                rotation: 0
              }}
              isSelected={isSelected}
              onToggle={() => onTogglePage(pageNumber)}
              isDraggable={false}
              selectedClassName="ring-2 ring-green-500 border-green-500 bg-green-50/5"
              selectedHeaderClassName="bg-green-500/10 border-green-500/20"
              selectedCheckboxColor="green-500"
              selectedTitleClassName="text-primary"
              selectionIcon={<Check className="w-8 h-8 text-green-500 drop-shadow-sm" />}
            />
          </div>
        );
      })}
    </div>
  );
}
