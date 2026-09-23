import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { endOfMonth, startOfMonth } from 'date-fns'
import type { Budget, Transaction } from '../types/transaction'
import {
  emiSplit,
  filterByRange,
  groupByBank,
  groupByCategory,
  groupByPayment,
  highValueTxs,
  monthCompare,
  monthlyEmiBreakdown,
  recurringAndEmi,
  sumSpend,
} from '../lib/analytics'
import {
  getCategoryLabel,
  getCategoryColor,
  formatINR,
  PAYMENT_LABELS,
} from '../lib/labels'
import { TxRow } from './TxRow'

const NOW = new Date('2026-09-18T15:00:00+05:30')

export function Analytics({
  transactions,
  budget,
  onEditCategory,
}: {
  transactions: Transaction[]
  budget: Budget
  onEditCategory: (tx: Transaction) => void
}) {
  const [section, setSection] = useState<'category' | 'bank' | 'payment'>('category')

  const monthTxs = useMemo(
    () => filterByRange(transactions, startOfMonth(NOW), endOfMonth(NOW)),
    [transactions]
  )
  const monthEmi = useMemo(() => emiSplit(monthTxs), [monthTxs])
  const emiHistory = useMemo(() => monthlyEmiBreakdown(transactions, NOW, 6), [transactions])

  const compare = useMemo(() => monthCompare(transactions, NOW), [transactions])
  const byCat = useMemo(() => groupByCategory(monthTxs), [monthTxs])
  const byBank = useMemo(() => groupByBank(monthTxs), [monthTxs])
  const byPay = useMemo(() => groupByPayment(monthTxs), [monthTxs])
  const high = useMemo(() => highValueTxs(monthTxs, 3000).slice(0, 8), [monthTxs])
  const recurring = useMemo(
    () => recurringAndEmi(monthTxs).slice(0, 10),
    [monthTxs]
  )

  const actual = sumSpend(monthTxs)
  const limit = budget.monthlyLimit
  const pct = Math.min(100, Math.round((actual / limit) * 100))

  const pieData = byCat.map((c) => ({
    name: getCategoryLabel(c.category),
    value: c.total,
    color: getCategoryColor(c.category),
  }))

  const bankData = byBank.map((b) => ({ name: b.bank, total: b.total }))
  const payData = byPay.map((p) => ({
    name: PAYMENT_LABELS[p.method],
    total: p.total,
  }))

  const compareData = [
    { name: 'Aug', total: compare.lastMonth },
    { name: 'Sep MTD', total: compare.thisMonth },
  ]

  const catBudget = useMemo(() => {
    const limits = budget.categoryLimits ?? {}
    const spent = Object.fromEntries(byCat.map((c) => [c.category, c.total])) as Record<
      string,
      number
    >
    const order = [
      'emi',
      'food_dining',
      'online_shopping',
      'bills_utilities',
      'petrol_fuel',
      'groceries',
      'leisure',
      'other',
    ] as const
    return order
      .filter((cat) => limits[cat] != null && (limits[cat] as number) > 0)
      .map((cat) => ({
        category: getCategoryLabel(cat),
        actual: spent[cat] ?? 0,
        budget: (limits[cat] as number) ?? 0,
      }))
  }, [byCat, budget])

  return (
    <div className="space-y-5 pb-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Budget vs actual (Sep)</h2>
          <span className="text-xs text-slate-500">
            {formatINR(actual)} / {formatINR(limit)}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${
              pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-teal-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {pct}% of monthly budget used · {formatINR(Math.max(0, limit - actual))} left
        </p>
      </section>

      <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-white to-rose-500/5 p-4 shadow-sm dark:from-amber-500/10 dark:via-slate-900 dark:to-rose-500/10 dark:border-amber-500/20">
        <h2 className="mb-1 text-sm font-semibold">After EMI — monthly compare</h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          How much you spent beyond EMIs each month (lifestyle spend).
        </p>
        <div className="mb-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/70 p-2 dark:bg-slate-950/40">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">EMI</p>
            <p className="text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatINR(monthEmi.emi)}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-2 dark:bg-slate-950/40">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">After EMI</p>
            <p className="text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">{formatINR(monthEmi.afterEmi)}</p>
          </div>
          <div className="rounded-xl bg-white/70 p-2 dark:bg-slate-950/40">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatINR(monthEmi.total)}</p>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emiHistory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip
                formatter={(v, name) => [formatINR(Number(v ?? 0)), name === 'emi' ? 'EMI' : 'After EMI']}
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === 'emi' ? 'EMI' : 'After EMI')} />
              <Bar dataKey="emi" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="afterEmi" stackId="a" fill="#fbbf24" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          This month after EMI: {formatINR(monthEmi.afterEmi)}
          {emiHistory.length >= 2 && emiHistory[emiHistory.length - 2].afterEmi > 0 && (
            <>
              {' '}
              · vs prior month {formatINR(emiHistory[emiHistory.length - 2].afterEmi)} (
              {(
                ((monthEmi.afterEmi - emiHistory[emiHistory.length - 2].afterEmi) /
                  emiHistory[emiHistory.length - 2].afterEmi) *
                100
              ).toFixed(0)}
              %)
            </>
          )}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Month compare</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compareData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="total" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-center text-xs text-slate-500">
          Sep MTD {formatINR(compare.thisMonth)} vs Aug {formatINR(compare.lastMonth)}
          {compare.lastMonth > 0 && (
            <>
              {' '}
              (
              {(((compare.thisMonth - compare.lastMonth) / compare.lastMonth) * 100).toFixed(0)}
              %)
            </>
          )}
        </p>
      </section>

      <div className="flex gap-2">
        {(['category', 'bank', 'payment'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              section === s
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold capitalize">By {section}</h2>
        {section === 'category' && (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {section === 'bank' && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bankData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={40} />
                <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="total" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {section === 'payment' && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={40} />
                <Tooltip formatter={(v) => formatINR(Number(v ?? 0))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="total" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {catBudget.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold">Category budgets</h2>
          <div className="space-y-3">
            {catBudget.map((c) => {
              const p = Math.min(100, Math.round((c.actual / c.budget) * 100))
              return (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{c.category}</span>
                    <span className="tabular-nums text-slate-500">
                      {formatINR(c.actual)} / {formatINR(c.budget)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${p > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(p, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-sm font-semibold">High-value (≥ ₹3,000)</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {high.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">None this month</p>
          ) : (
            high.map((tx) => (
              <TxRow key={tx.id} tx={tx} onEditCategory={onEditCategory} compact />
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-sm font-semibold">Recurring & EMI</h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recurring.map((tx) => (
            <TxRow key={tx.id} tx={tx} onEditCategory={onEditCategory} compact />
          ))}
        </div>
      </section>
    </div>
  )
}
