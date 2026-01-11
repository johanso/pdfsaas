"use client";

import { FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThumbnailSkeletonProps {
  className?: string;
}

export function ThumbnailSkeleton({ className }: ThumbnailSkeletonProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-900",
        className
      )}
    >

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      <div className="relative flex flex-col items-center gap-2">
        <div className="p-3 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
          <Loader2 className="w-5 h-5 animate-spin text-primary/60" />
        </div>
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest animate-pulse">
          Cargando vista
        </span>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
