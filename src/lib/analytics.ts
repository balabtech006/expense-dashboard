import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  parseISO,
  isWithinInterval,
  format,
  eachDayOfInterval,
} from 'date-fns'
import type { Category, PaymentMethod, Bank, Transaction } from '../types/transaction'

export function isSpend(tx: Transaction): boolean {
  return tx.status === 'posted' || tx.status === 'pending'
}

export function spendAmount(tx: Transaction): number {
  if (tx.status === 'refunded' || tx.status === 'reversed') return -Math.abs(tx.amount)
  if (tx.status === 'failed') return 0
  return Math.abs(tx.amount)
}

export function filterByRange(
  txs: Transaction[],
  from: Date,
  to: Date
): Transaction[] {
  return txs.filter((tx) => {
    const d = parseISO(tx.datetime)
    return isWithinInterval(d, { start: from, end: to })
  })
}

export function sumSpend(txs: Transaction[]): number {
  return txs.reduce((acc, tx) => acc + spendAmount(tx), 0)
}

export function todaySpend(txs: Transaction[], now = new Date()): number {
  return sumSpend(filterByRange(txs, startOfDay(now), endOfDay(now)))
}

export function monthSpend(txs: Transaction[], now = new Date()): number {
  return sumSpend(filterByRange(txs, startOfMonth(now), endOfMonth(now)))
}

export function yearSpend(txs: Transaction[], now = new Date()): number {
  return sumSpend(filterByRange(txs, startOfYear(now), endOfYear(now)))
}

export function groupByCategory(
  txs: Transaction[]
): { category: Category; total: number }[] {
  const map = new Map<Category, number>()
  for (const tx of txs) {
    if (!isSpend(tx) && tx.status !== 'refunded' && tx.status !== 'reversed') continue
    map.set(tx.category, (map.get(tx.category) ?? 0) + spendAmount(tx))
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
}

export function groupByBank(txs: Transaction[]): { bank: Bank; total: number }[] {
  const map = new Map<Bank, number>()
  for (const tx of txs) {
    map.set(tx.bank, (map.get(tx.bank) ?? 0) + spendAmount(tx))
  }
  return [...map.entries()]
    .map(([bank, total]) => ({ bank, total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
}

export function groupByPayment(
  txs: Transaction[]
): { method: PaymentMethod; total: number }[] {
  const map = new Map<PaymentMethod, number>()
  for (const tx of txs) {
    map.set(tx.paymentMethod, (map.get(tx.paymentMethod) ?? 0) + spendAmount(tx))
  }
  return [...map.entries()]
    .map(([method, total]) => ({ method, total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
}

export function topMerchants(
  txs: Transaction[],
  limit = 8
): { merchant: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>()
  for (const tx of txs) {
    const amt = spendAmount(tx)
    if (amt <= 0) continue
    const cur = map.get(tx.merchant) ?? { total: 0, count: 0 }
    cur.total += amt
    cur.count += 1
    map.set(tx.merchant, cur)
  }
  return [...map.entries()]
    .map(([merchant, v]) => ({ merchant, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}

export function dailyTrend(
  txs: Transaction[],
  from: Date,
  to: Date
): { date: string; label: string; total: number }[] {
  const days = eachDayOfInterval({ start: from, end: to })
  return days.map((day) => {
    const dayTxs = filterByRange(txs, startOfDay(day), endOfDay(day))
    return {
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'd MMM'),
      total: sumSpend(dayTxs),
    }
  })
}

export function monthCompare(txs: Transaction[], now = new Date()) {
  const thisMonthTxs = filterByRange(txs, startOfMonth(now), endOfMonth(now))
  const lastMonthTxs = filterByRange(
    txs,
    startOfMonth(subMonths(now, 1)),
    endOfMonth(subMonths(now, 1))
  )
  return {
    thisMonth: sumSpend(thisMonthTxs),
    lastMonth: sumSpend(lastMonthTxs),
    thisMonthTxs,
    lastMonthTxs,
  }
}

export function highValueTxs(txs: Transaction[], threshold = 3000): Transaction[] {
  return [...txs]
    .filter((tx) => Math.abs(spendAmount(tx)) >= threshold)
    .sort((a, b) => Math.abs(spendAmount(b)) - Math.abs(spendAmount(a)))
}

export function recurringAndEmi(txs: Transaction[]): Transaction[] {
  const merchants = new Map<string, number>()
  for (const tx of txs) {
    if (tx.paymentMethod === 'emi' || tx.category === 'emi') continue
    merchants.set(tx.merchant, (merchants.get(tx.merchant) ?? 0) + 1)
  }
  const recurringMerchants = new Set(
    [...merchants.entries()].filter(([, c]) => c >= 2).map(([m]) => m)
  )
  return txs
    .filter(
      (tx) =>
        tx.paymentMethod === 'emi' ||
        tx.category === 'emi' ||
        recurringMerchants.has(tx.merchant)
    )
    .sort((a, b) => parseISO(b.datetime).getTime() - parseISO(a.datetime).getTime())
}

export function isEmiTx(tx: Transaction): boolean {
  return tx.category === 'emi' || tx.paymentMethod === 'emi'
}

export function emiSplit(txs: Transaction[]): {
  emi: number
  other: number
  total: number
  afterEmi: number
} {
  let emi = 0
  let other = 0
  for (const tx of txs) {
    const amt = spendAmount(tx)
    if (isEmiTx(tx)) emi += amt
    else other += amt
  }
  return { emi, other, total: emi + other, afterEmi: other }
}

export function monthlyEmiBreakdown(
  txs: Transaction[],
  now = new Date(),
  months = 6
): {
  key: string
  label: string
  emi: number
  other: number
  total: number
  afterEmi: number
}[] {
  const rows = []
  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(now, i)
    const range = filterByRange(txs, startOfMonth(d), endOfMonth(d))
    const split = emiSplit(range)
    rows.push({
      key: format(d, 'yyyy-MM'),
      label: format(d, 'MMM'),
      ...split,
    })
  }
  return rows
}
