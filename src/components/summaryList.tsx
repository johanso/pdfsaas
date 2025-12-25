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

  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between gap-2 cursor-pointer lg:cursor-auto group">
        <h3 className="text-md font-bold">{title}:</h3>
      </div>

      <ul className="block px-3 py-2 divide-y divide-gray-200/50 border-zinc-200 dark:border-zinc-600 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-lg text-sm lg:text-xs">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex justify-between gap-4 items-center py-2"
          >
            <span className="font-normal">{item.label}</span>
            <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
