import { useState } from "react";
import { toast } from "sonner";

export function usePageSelection(totalPages: number = 0) {
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const togglePage = (pageNumber: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber).sort((a, b) => a - b);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  const selectAll = () => {
    if (totalPages === 0) return;
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(all);
    toast.info("Todas las páginas seleccionadas");
  };

  const deselectAll = () => {
    setSelectedPages([]);
    toast.info("Selección limpiada");
  };

  const invertSelection = () => {
    if (totalPages === 0) return;
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    setSelectedPages(prev => {
      const newSelection = all.filter(p => !prev.includes(p));
      return newSelection;
    });
    toast.info("Selección invertida");
  };

  const selectByRange = (rangeInput: string) => {
    if (!rangeInput.trim()) return;

    const selectedIds: number[] = [];
    const parts = rangeInput.split(",");

    parts.forEach(part => {
      const range = part.trim().split("-");
      if (range.length === 2) {
        const start = parseInt(range[0]);
        const end = parseInt(range[1]);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= totalPages) {
              selectedIds.push(i);
            }
          }
        }
      } else if (range.length === 1) {
        const pageNum = parseInt(range[0]);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          selectedIds.push(pageNum);
        }
      }
    });

    const uniqueIds = Array.from(new Set(selectedIds));
    if (uniqueIds.length > 0) {
      setSelectedPages(uniqueIds);
    }
  };

  const reset = () => {
    setSelectedPages([]);
  };

  return {
    selectedPages,
    setSelectedPages,
    togglePage,
    selectAll,
    deselectAll,
    invertSelection,
    selectByRange,
    reset
  };
}