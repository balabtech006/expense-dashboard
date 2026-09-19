import type { Category, CustomCategory } from '../types/transaction'
import { allCategoryOptions } from '../lib/labels'

export function CategorySelect({
  value,
  onChange,
  customCategories = [],
  className = '',
}: {
  value: Category
  onChange: (c: Category) => void
  customCategories?: CustomCategory[]
  className?: string
}) {
  const options = allCategoryOptions(customCategories)
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Category)}
      className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {options.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  )
}
