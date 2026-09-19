import { useMemo, useState } from 'react'
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  isWithinInterval,
} from 'date-fns'
import type { Bank, Category, PaymentMethod, Transaction } from '../types/transaction'
import {
  BANKS,
  CATEGORIES,
  CATEGORY_LABELS,
  formatINR,
  PAYMENT_LABELS,
  PAYMENT_METHODS,
} from '../lib/labels'
import { spendAmount } from '../lib/analytics'
import { TxRow } from './TxRow'
import { CategorySelect } from './CategorySelect'
import { CopyMinus, Filter, Search, Trash2, X } from 'lucide-react'

type DatePreset = 'all' | 'today' | '7d' | 'mtd' | 'ytd' | 'aug' | 'sep'

const NOW = new Date('2026-09-18T15:00:00+05:30')

function rangeForPreset(preset: DatePreset): { from: Date; to: Date } | null {
  switch (preset) {
    case 'today':
      return { from: startOfDay(NOW), to: endOfDay(NOW) }
    case '7d':
      return { from: startOfDay(subDays(NOW, 6)), to: endOfDay(NOW) }
    case 'mtd':
      return { from: startOfMonth(NOW), to: endOfMonth(NOW) }
    case 'ytd':
      return { from: startOfYear(NOW), to: endOfYear(NOW) }
    case 'aug':
      return {
        from: new Date('2026-08-01T00:00:00+05:30'),
        to: new Date('2026-08-31T23:59:59+05:30'),
      }
    case 'sep':
      return {
        from: new Date('2026-09-01T00:00:00+05:30'),
        to: new Date('2026-09-30T23:59:59+05:30'),
      }
    default:
      return null
  }
}

export function Transactions({
  transactions,
  onUpdateCategory,
  onDeleteTransaction,
  onRemoveDuplicates,
}: {
  transactions: Transaction[]
  onUpdateCategory: (id: string, category: Category) => void
  onDeleteTransaction: (id: string) => void
  onRemoveDuplicates: () => number
}) {
  const [preset, setPreset] = useState<DatePreset>('mtd')
  const [bank, setBank] = useState<Bank | ''>('')
  const [payment, setPayment] = useState<PaymentMethod | ''>('')
  const [category, setCategory] = useState<Category | ''>('')
  const [search, setSearch] = useState('')
  const [minAmt, setMinAmt] = useState('')
  const [maxAmt, setMaxAmt] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    const range = rangeForPreset(preset)
    const min = minAmt ? Number(minAmt) : null
    const max = maxAmt ? Number(maxAmt) : null
    const q = search.trim().toLowerCase()

    return transactions.filter((tx) => {
      if (range) {
        const d = parseISO(tx.datetime)
        if (!isWithinInterval(d, { start: range.from, end: range.to })) return false
      }
      if (bank && tx.bank !== bank) return false
      if (payment && tx.paymentMethod !== payment) return false
      if (category && tx.category !== category) return false
      if (q && !tx.merchant.toLowerCase().includes(q)) return false
      const abs = Math.abs(tx.amount)
      if (min !== null && !Number.isNaN(min) && abs < min) return false
      if (max !== null && !Number.isNaN(max) && abs > max) return false
      return true
    })
  }, [transactions, preset, bank, payment, category, search, minAmt, maxAmt])

  const total = filtered.reduce((a, t) => a + spendAmount(t), 0)

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-indigo-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className={`rounded-xl border p-2.5 ${
            showFilters
              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'
              : 'border-slate-200 dark:border-slate-700'
          }`}
          aria-label="Filters"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            ['mtd', 'This month'],
            ['today', 'Today'],
            ['7d', '7 days'],
            ['sep', 'Sep'],
            ['aug', 'Aug'],
            ['ytd', 'Year'],
            ['all', 'All'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPreset(id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              preset === id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value as Bank | '')}
            className="rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-sm dark:border-slate-700"
          >
            <option value="">All banks</option>
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value as PaymentMethod | '')}
            className="rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-sm dark:border-slate-700"
          >
            <option value="">All payments</option>
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {PAYMENT_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | '')}
            className="rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-sm dark:border-slate-700"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <input
              type="number"
              placeholder="Min ₹"
              value={minAmt}
              onChange={(e) => setMinAmt(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-sm dark:border-slate-700"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={maxAmt}
              onChange={(e) => setMaxAmt(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-sm dark:border-slate-700"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
        <span>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const n = onRemoveDuplicates()
              alert(n > 0 ? `Removed ${n} duplicate${n === 1 ? '' : 's'}` : 'No duplicates found')
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <CopyMinus className="h-3.5 w-3.5" />
            Remove duplicates
          </button>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {formatINR(total)}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white px-1 py-1 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No transactions match your filters.
          </p>
        ) : (
          filtered.map((tx) => (
            <TxRow key={tx.id} tx={tx} onEditCategory={setEditing} />
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{editing.merchant}</h3>
                <p className="text-sm text-slate-500">
                  {formatINR(editing.amount)} · {editing.bank}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Category (saved as rule for this merchant)
            </label>
            <CategorySelect
              value={editing.category}
              onChange={(c) => {
                onUpdateCategory(editing.id, c)
                setEditing({ ...editing, category: c })
              }}
              className="w-full"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Delete "${editing.merchant}" (${formatINR(editing.amount)})?`)) return
                  onDeleteTransaction(editing.id)
                  setEditing(null)
                }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-[1.4] rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
