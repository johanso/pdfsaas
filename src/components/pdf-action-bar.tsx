"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PdfActionBarProps {
    infoText?: ReactNode;
    actionButton: ReactNode;
    className?: string;
}

export function PdfActionBar({ infoText, actionButton, className }: PdfActionBarProps) {
    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-40 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-background/80 backdrop-blur-xl",
            className
        )}>
            <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {infoText}
                </div>
                <div>
                    {actionButton}
                </div>
            </div>
        </div>
    );
}
