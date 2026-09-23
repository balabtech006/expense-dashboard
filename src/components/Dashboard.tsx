import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  IndianRupee,
  Landmark,
  Minus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  endOfMonth,
  startOfMonth,
  startOfDay,
  subDays,
} from 'date-fns'
import type {
  Budget,
  CustomCategory,
  Incomes,
  Investment,
  Transaction,
} from '../types/transaction'
import {
  dailyTrend,
  emiSplit,
  filterByRange,
  groupByCategory,
  monthCompare,
  monthSpend,
  todaySpend,
  topMerchants,
  yearSpend,
} from '../lib/analytics'
import {
  formatCompactINR,
  formatINR,
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from '../lib/labels'
import { generateMonthlyInsight, householdIncome } from '../lib/insights'
import { StatCard } from './StatCard'
import { TxRow } from './TxRow'
import { APP_NOW } from '../hooks/useAppState'

const NOW = APP_NOW

export function Dashboard({
  transactions,
  budget,
  incomes,
  investments,
  customCategories,
  onEditCategory,
}: {
  transactions: Transaction[]
  budget: Budget
  incomes: Incomes
  investments: Investment[]
  customCategories: CustomCategory[]
  onEditCategory: (tx: Transaction) => void
}) {
  const today = todaySpend(transactions, NOW)
  const month = monthSpend(transactions, NOW)
  const year = yearSpend(transactions, NOW)

  const monthTxs = useMemo(
    () => filterByRange(transactions, startOfMonth(NOW), endOfMonth(NOW)),
    [transactions]
  )
  const emi = useMemo(() => emiSplit(monthTxs), [monthTxs])
  const compare = useMemo(() => monthCompare(transactions, NOW), [transactions])
  const lastEmi = useMemo(() => emiSplit(compare.lastMonthTxs), [compare.lastMonthTxs])

  const trend = useMemo(() => {
    const from = startOfDay(subDays(NOW, 13))
    return dailyTrend(transactions, from, NOW)
  }, [transactions])

  const categories = useMemo(() => groupByCategory(monthTxs), [monthTxs])
  const merchants = useMemo(() => topMerchants(monthTxs, 5), [monthTxs])
  const recent = useMemo(() => transactions.slice(0, 8), [transactions])

  const insight = useMemo(
    () => generateMonthlyInsight(transactions, budget, incomes, customCategories, NOW),
    [transactions, budget, incomes, customCategories]
  )

  const incomeTotal = householdIncome(incomes)
  const plannedInvestments = useMemo(
    () => investments.reduce((a, i) => a + (i.monthlyAmount || 0), 0),
    [investments]
  )
  const afterSpend = Math.max(0, incomeTotal - month)
  const afterInvest = Math.max(0, afterSpend - plannedInvestments)
  const budgetPct = budget.monthlyLimit > 0
    ? Math.min(100, Math.round((month / budget.monthlyLimit) * 100))
    : 0

  const deltaTotal = compare.thisMonth - compare.lastMonth
  const deltaPct =
    compare.lastMonth > 0
      ? Math.round((deltaTotal / compare.lastMonth) * 100)
      : null
  const deltaAfter = emi.afterEmi - lastEmi.afterEmi
  const DeltaIcon =
    deltaTotal > 0 ? ArrowUpRight : deltaTotal < 0 ? ArrowDownRight : Minus

  return (
    <div className="space-y-5 pb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Today"
          value={formatINR(today)}
          sub="18 Sep 2026"
          accent="teal"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <StatCard
          label="This month"
          value={formatINR(month)}
          sub={`${budgetPct}% of ${formatINR(budget.monthlyLimit)} budget`}
          accent="indigo"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="This year"
          value={formatINR(year)}
          sub="2026 YTD"
          accent="rose"
          icon={<CalendarRange className="h-5 w-5" />}
        />
      </div>

      {(incomeTotal > 0 || plannedInvestments > 0) && (
        <section className="rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-500/10 via-white to-indigo-500/5 p-4 shadow-sm dark:from-teal-500/15 dark:via-slate-900 dark:to-indigo-500/10 dark:border-teal-500/20">
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Income leftover vs planned investments
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl bg-white/70 p-2.5 dark:bg-slate-950/40">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Income</p>
              <p className="text-sm font-bold tabular-nums text-teal-700 dark:text-teal-300">
                {formatINR(incomeTotal)}
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-2.5 dark:bg-slate-950/40">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Spent</p>
              <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                {formatINR(month)}
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-2.5 dark:bg-slate-950/40">
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500">
                <TrendingUp className="h-3 w-3" /> Planned invest
              </p>
              <p className="text-sm font-bold tabular-nums text-indigo-600 dark:text-indigo-300">
                {formatINR(plannedInvestments)}
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-2.5 dark:bg-slate-950/40">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Left after invest</p>
              <p className={`text-sm font-bold tabular-nums ${afterInvest > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                {formatINR(afterInvest)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            After spend leftover ~{formatINR(afterSpend)}. Investments are goals only — not counted as expenses.
            {plannedInvestments > afterSpend && incomeTotal > 0
              ? ` Planned SIPs/FDs exceed leftover by ${formatINR(plannedInvestments - afterSpend)}.`
              : ''}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-white to-indigo-500/5 p-4 shadow-sm dark:from-violet-500/15 dark:via-slate-900 dark:to-indigo-500/10 dark:border-violet-500/20">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-lg bg-violet-100 p-1.5 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              AI insight
            </h2>
            <p className="text-[10px] uppercase tracking-wide text-violet-600/80 dark:text-violet-300/80">
              Smart summary · this month
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {insight}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold">This month vs last month</h2>
          </div>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
              deltaTotal > 0
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                : deltaTotal < 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
            }`}
          >
            <DeltaIcon className="h-3.5 w-3.5" />
            {deltaPct !== null
              ? `${deltaPct > 0 ? '+' : ''}${deltaPct}%`
              : formatINR(Math.abs(deltaTotal))}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Aug total</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums">{formatINR(compare.lastMonth)}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              After EMI {formatINR(lastEmi.afterEmi)}
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950/40">
            <p className="text-[10px] uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
              Sep MTD
            </p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-indigo-700 dark:text-indigo-200">
              {formatINR(compare.thisMonth)}
            </p>
            <p className="mt-1 text-[11px] text-indigo-600/80 dark:text-indigo-300/80">
              After EMI {formatINR(emi.afterEmi)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>
            Δ total {deltaTotal >= 0 ? '+' : ''}
            {formatINR(deltaTotal)}
          </span>
          <span>
            Δ after EMI {deltaAfter >= 0 ? '+' : ''}
            {formatINR(deltaAfter)}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-white to-indigo-500/5 p-4 shadow-sm dark:from-amber-500/10 dark:via-slate-900 dark:to-indigo-500/10 dark:border-amber-500/20">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Landmark className="h-4 w-4 text-rose-500" />
            EMI vs other spend (this month)
          </h2>
          <span className="text-[11px] text-slate-500">Sep 2026 MTD</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total EMI"
            value={formatINR(emi.emi)}
            sub={`${emi.total > 0 ? Math.round((emi.emi / emi.total) * 100) : 0}% of month`}
            accent="rose"
            icon={<Landmark className="h-5 w-5" />}
          />
          <StatCard
            label="After EMI"
            value={formatINR(emi.afterEmi)}
            sub="Lifestyle / other spend"
            accent="amber"
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            label="Month total"
            value={formatINR(emi.total)}
            sub="EMI + other"
            accent="indigo"
            icon={<CalendarDays className="h-5 w-5" />}
          />
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-slate-500">
            <span>EMI {formatINR(emi.emi)}</span>
            <span>Other {formatINR(emi.afterEmi)}</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="bg-rose-500"
              style={{ width: `${emi.total > 0 ? (emi.emi / emi.total) * 100 : 0}%` }}
            />
            <div
              className="bg-amber-400"
              style={{ width: `${emi.total > 0 ? (emi.afterEmi / emi.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
          14-day spend trend
        </h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                className="fill-slate-500"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => formatCompactINR(v)}
                width={40}
              />
              <Tooltip
                formatter={(v) => formatINR(Number(v ?? 0))}
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#spendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Categories · % of month
          </h2>
          <ul className="space-y-2.5">
            {categories.slice(0, 8).map((c) => {
              const Icon = getCategoryIcon(c.category, customCategories)
              const pct = emi.total > 0 ? Math.round((c.total / emi.total) * 100) : 0
              const color = getCategoryColor(c.category, customCategories)
              return (
                <li key={c.category} className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate font-medium">
                        {getCategoryLabel(c.category, customCategories)}
                      </span>
                      <span className="ml-2 shrink-0 tabular-nums text-slate-500">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatINR(c.total)}
                  </span>
                </li>
              )
            })}
            {categories.length === 0 && (
              <p className="py-4 text-center text-xs text-slate-500">No spend yet</p>
            )}
          </ul>
          {categories.length > 0 && (
            <div className="mt-3 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={70}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(c) =>
                      getCategoryLabel(c, customCategories).split(' ')[0]
                    }
                  />
                  <Tooltip
                    formatter={(v) => formatINR(Number(v ?? 0))}
                    labelFormatter={(c) => getCategoryLabel(String(c), customCategories)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {categories.slice(0, 6).map((c) => (
                      <Cell
                        key={c.category}
                        fill={getCategoryColor(c.category, customCategories)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Top merchants (Sep)
          </h2>
          <ul className="space-y-2.5">
            {merchants.map((m, i) => (
              <li key={m.merchant} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.merchant}</p>
                  <p className="text-[11px] text-slate-500">{m.count} txns</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatINR(m.total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          Recent transactions
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.map((tx) => (
            <TxRow
              key={tx.id}
              tx={tx}
              onEditCategory={onEditCategory}
              compact
              customCategories={customCategories}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
