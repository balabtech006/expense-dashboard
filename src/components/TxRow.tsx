import { format, parseISO } from 'date-fns'
import type { Category, CustomCategory, Transaction } from '../types/transaction'
import {
  getCategoryIcon,
  getCategoryLabel,
  formatINR,
  PAYMENT_LABELS,
} from '../lib/labels'
import { StatusBadge } from './StatusBadge'
import { spendAmount } from '../lib/analytics'

export function TxRow({
  tx,
  onEditCategory,
  compact,
  customCategories = [],
}: {
  tx: Transaction
  onEditCategory?: (tx: Transaction) => void
  compact?: boolean
  customCategories?: CustomCategory[]
}) {
  const amt = spendAmount(tx)
  const isRefund = tx.status === 'refunded' || tx.status === 'reversed'
  const Icon = getCategoryIcon(tx.category, customCategories)

  return (
    <button
      type="button"
      onClick={() => onEditCategory?.(tx)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isRefund
            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
            : tx.category === 'emi'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-slate-900 dark:text-slate-100">
            {tx.merchant}
          </p>
          <StatusBadge status={tx.status} />
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {format(parseISO(tx.datetime), compact ? 'd MMM · HH:mm' : 'd MMM yyyy · HH:mm')}
          {' · '}
          {tx.bank} · {PAYMENT_LABELS[tx.paymentMethod]}
          {!compact && ` · ${getCategoryLabel(tx.category as Category, customCategories)}`}
        </p>
      </div>
      <div
        className={`shrink-0 text-right font-semibold tabular-nums ${
          isRefund
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {isRefund ? '−' : ''}
        {formatINR(Math.abs(amt))}
      </div>
    </button>
  )
}
