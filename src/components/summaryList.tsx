import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SummaryItem = {
  label: React.ReactNode
  value: React.ReactNode
}

type SummaryListProps = {
  title?: string
  items: SummaryItem[]
}

export const SummaryList: React.FC<SummaryListProps> = ({
  title = 'Resumen',
  items,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between gap-2 cursor-pointer lg:cursor-auto group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-md font-bold">{title}:</h3>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-500 transition-transform lg:hidden size-6!",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      <ul className={cn(
        "px-3 py-2 divide-y divide-gray-200/50 border-zinc-200 dark:border-zinc-600 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg text-xs",
        isExpanded ? "block" : "hidden lg:block"
      )}>
        {items.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center py-2"
          >
            <span className="font-normal">{item.label}</span>
            <span className="font-bold">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
