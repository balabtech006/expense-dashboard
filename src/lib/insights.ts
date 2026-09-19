import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import type { Budget, CustomCategory, Incomes, Transaction } from '../types/transaction'
import { emiSplit, filterByRange, groupByCategory } from './analytics'
import { formatINR, getCategoryLabel } from './labels'

export function generateMonthlyInsight(
  transactions: Transaction[],
  budget: Budget,
  incomes: Incomes,
  customCategories: CustomCategory[],
  now: Date
): string {
  const thisTxs = filterByRange(transactions, startOfMonth(now), endOfMonth(now))
  const lastTxs = filterByRange(
    transactions,
    startOfMonth(subMonths(now, 1)),
    endOfMonth(subMonths(now, 1))
  )

  const thisSplit = emiSplit(thisTxs)
  const lastSplit = emiSplit(lastTxs)
  const cats = groupByCategory(thisTxs)
  const top = cats.slice(0, 3)
  const monthLabel = format(now, 'MMMM')
  const limit = budget.monthlyLimit
  const pctBudget = limit > 0 ? Math.round((thisSplit.total / limit) * 100) : 0
  const leftoverBudget = limit - thisSplit.total

  const incomeTotal = (incomes.balaMonthly || 0) + (incomes.wifeMonthly || 0)
  const incomeLeftover = incomeTotal > 0 ? incomeTotal - thisSplit.total : null

  const deltaTotal = thisSplit.total - lastSplit.total
  const deltaPct =
    lastSplit.total > 0 ? Math.round((deltaTotal / lastSplit.total) * 100) : null
  const deltaAfter = thisSplit.afterEmi - lastSplit.afterEmi

  const parts: string[] = []

  parts.push(
    `${monthLabel}: you've spent ${formatINR(thisSplit.total)} so far` +
      (limit > 0
        ? ` (${pctBudget}% of your ${formatINR(limit)} budget` +
          (leftoverBudget >= 0
            ? `, ${formatINR(leftoverBudget)} left)`
            : `, over by ${formatINR(Math.abs(leftoverBudget))})`)
        : '.')
  )

  const emiPct =
    thisSplit.total > 0 ? Math.round((thisSplit.emi / thisSplit.total) * 100) : 0
  parts.push(
    `EMIs take ${formatINR(thisSplit.emi)} (${emiPct}%), leaving ${formatINR(thisSplit.afterEmi)} for lifestyle.`
  )

  if (top.length > 0) {
    const topStr = top
      .map(
        (c) =>
          `${getCategoryLabel(c.category, customCategories)} ${formatINR(c.total)}` +
          (thisSplit.total > 0
            ? ` (${Math.round((c.total / thisSplit.total) * 100)}%)`
            : '')
      )
      .join(', ')
    parts.push(`Top categories: ${topStr}.`)
  }

  if (lastSplit.total > 0 && deltaPct !== null) {
    const dir = deltaTotal > 0 ? 'up' : deltaTotal < 0 ? 'down' : 'flat'
    parts.push(
      `Vs last month: total is ${dir} ${formatINR(Math.abs(deltaTotal))}` +
        (deltaPct !== 0 ? ` (${deltaPct > 0 ? '+' : ''}${deltaPct}%)` : '') +
        `; after-EMI ${deltaAfter >= 0 ? '+' : ''}${formatINR(deltaAfter)}.`
    )
  }

  if (incomeLeftover !== null) {
    parts.push(
      incomeLeftover >= 0
        ? `Household income ${formatINR(incomeTotal)} leaves ~${formatINR(incomeLeftover)} after this month's spend.`
        : `Household income ${formatINR(incomeTotal)} is short by ${formatINR(Math.abs(incomeLeftover))} vs spend — watch the gap.`
    )
  }

  return parts.join(' ')
}

export function householdIncome(incomes: Incomes): number {
  return (incomes.balaMonthly || 0) + (incomes.wifeMonthly || 0)
}
