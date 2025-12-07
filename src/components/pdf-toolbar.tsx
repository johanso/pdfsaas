"use client";

import { Button } from "@/components/ui/button";
import { Plus, RotateCw, Trash2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfToolbarProps {
    title: string;
    subtitle?: string;
    onAdd?: () => void;
    onRotateAll?: () => void;
    onSort?: () => void;
    onReset?: () => void;
    showAddButton?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function PdfToolbar({
    title,
    subtitle,
    onAdd,
    onRotateAll,
    onSort,
    onReset,
    showAddButton = true,
    className,
    children
}: PdfToolbarProps) {
    return (
        <div className={cn(
            "sticky top-0 z-30 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4",
            className
        )}>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-hidden">
                <div className="font-medium truncate" title={title}>
                    {title}
                </div>
                {subtitle && (
                    <div className="text-xs text-zinc-500 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md whitespace-nowrap">
                        {subtitle}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                {children}

                {showAddButton && onAdd && (
                    <Button variant="outline" onClick={onAdd} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir
                    </Button>
                )}

                {onRotateAll && (
                    <Button variant="outline" onClick={onRotateAll} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                        <RotateCw className="w-4 h-4 mr-2" />
                        Rotar todo
                    </Button>
                )}

                {onSort && (
                    <Button variant="outline" onClick={onSort} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Ordenar
                    </Button>
                )}

                {onReset && (
                    <Button variant="destructive" onClick={onReset} className="ml-auto md:ml-0">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Limpiar
                    </Button>
                )}
            </div>
        </div>
    );
}
