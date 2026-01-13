"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> { }

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn("relative overflow-auto custom-scrollbar", className)}
                {...props}
            >
                <div className="h-full w-full">
                    {children}
                </div>
                <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(100, 100, 100, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 100, 100, 0.3);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(200, 200, 200, 0.1);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(200, 200, 200, 0.2);
          }
        `}</style>
            </div>
        )
    }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
