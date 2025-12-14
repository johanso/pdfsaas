import { useState, useCallback } from "react";

export function useMultiSelect<T>(
  items: T[],
  getId: (item: T) => string | number
) {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const toggle = useCallback((id: string | number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(getId)));
  }, [items, getId]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const invertSelection = useCallback(() => {
    const allIds = new Set(items.map(getId));
    setSelectedIds(prev => {
      const newSet = new Set<string | number>();
      allIds.forEach(id => {
        if (!prev.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [items, getId]);

  const isSelected = useCallback((id: string | number) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedSet: selectedIds,
    toggle,
    selectAll,
    deselectAll,
    invertSelection,
    isSelected,
    count: selectedIds.size
  };
}