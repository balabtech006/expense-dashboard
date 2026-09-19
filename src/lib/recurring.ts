import { format, getDaysInMonth, setDate, startOfMonth } from 'date-fns'
import type { RecurringExpense, Transaction } from '../types/transaction'

export function recurringTxnId(recurringId: string, yearMonth: string): string {
  return `recurring-${recurringId}-${yearMonth}`
}

export function ensureRecurringTransactions(
  transactions: Transaction[],
  recurrings: RecurringExpense[],
  now: Date
): { transactions: Transaction[]; added: number } {
  const yearMonth = format(now, 'yyyy-MM')
  const daysInMonth = getDaysInMonth(now)
  const existingIds = new Set(transactions.map((t) => t.id))
  const added: Transaction[] = []

  for (const r of recurrings) {
    if (!r.active) continue
    const id = recurringTxnId(r.id, yearMonth)
    if (existingIds.has(id)) continue

    const day = Math.min(Math.max(1, r.dayOfMonth), daysInMonth)
    const dt = setDate(startOfMonth(now), day)
    const datetime = `${format(dt, 'yyyy-MM-dd')}T12:00:00+05:30`

    added.push({
      id,
      datetime,
      amount: r.amount,
      merchant: r.name,
      bank: r.bank ?? 'Other',
      paymentMethod: r.paymentMethod ?? 'bank_transfer',
      category: r.category,
      status: 'posted',
      source: {
        provider: 'recurring',
        subject: `Recurring: ${r.name}`,
        snippet: `Auto-posted day ${r.dayOfMonth}`,
      },
    })
    existingIds.add(id)
  }

  if (added.length === 0) return { transactions, added: 0 }

  const merged = [...transactions, ...added].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  )
  return { transactions: merged, added: added.length }
}
