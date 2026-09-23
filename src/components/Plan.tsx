import { useState } from 'react'
import {
  CalendarClock,
  Plus,
  Repeat,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import type {
  Category,
  CustomCategory,
  GoalTag,
  Investment,
  InvestmentType,
  RecurringExpense,
} from '../types/transaction'
import {
  CategorySelect,
} from './CategorySelect'
import {
  GOAL_TAG_ICONS,
  GOAL_TAG_LABELS,
  INVESTMENT_TYPE_ICONS,
  getCategoryIcon,
  getCategoryLabel,
  formatINR,
} from '../lib/labels'

const INVESTMENT_TYPES: InvestmentType[] = ['FD', 'RD', 'SIP', 'Savings Account']
const GOAL_TAGS: GoalTag[] = [
  'home_loan_preclose',
  'emergency_fund',
  'baby_expenses',
  'custom',
]

export function Plan({
  recurrings,
  investments,
  customCategories,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onAddInvestment,
  onUpdateInvestment,
  onDeleteInvestment,
}: {
  recurrings: RecurringExpense[]
  investments: Investment[]
  customCategories: CustomCategory[]
  onAddRecurring: (item: Omit<RecurringExpense, 'id' | 'active'> & { active?: boolean }) => void
  onUpdateRecurring: (id: string, patch: Partial<RecurringExpense>) => void
  onDeleteRecurring: (id: string) => void
  onAddInvestment: (item: Omit<Investment, 'id'>) => void
  onUpdateInvestment: (id: string, patch: Partial<Investment>) => void
  onDeleteInvestment: (id: string) => void
}) {
  const [recName, setRecName] = useState('')
  const [recAmt, setRecAmt] = useState('')
  const [recDay, setRecDay] = useState('1')
  const [recCat, setRecCat] = useState<Category>('bills_utilities')

  const [invName, setInvName] = useState('')
  const [invAmt, setInvAmt] = useState('')
  const [invType, setInvType] = useState<InvestmentType>('SIP')
  const [invGoal, setInvGoal] = useState<GoalTag>('emergency_fund')
  const [invCustomGoal, setInvCustomGoal] = useState('')
  const [invNotes, setInvNotes] = useState('')

  const addRec = () => {
    if (!recName.trim() || !Number(recAmt)) return
    onAddRecurring({
      name: recName.trim(),
      amount: Number(recAmt),
      category: recCat,
      dayOfMonth: Math.min(31, Math.max(1, Number(recDay) || 1)),
    })
    setRecName('')
    setRecAmt('')
    setRecDay('1')
  }

  const addInv = () => {
    if (!invName.trim() || !Number(invAmt)) return
    onAddInvestment({
      name: invName.trim(),
      type: invType,
      monthlyAmount: Number(invAmt),
      goalTag: invGoal,
      customGoal: invGoal === 'custom' ? invCustomGoal.trim() : undefined,
      notes: invNotes.trim() || undefined,
      progressNotes: '',
    })
    setInvName('')
    setInvAmt('')
    setInvNotes('')
    setInvCustomGoal('')
  }

  const plannedMonthly = investments.reduce((a, i) => a + (i.monthlyAmount || 0), 0)

  return (
    <div className="space-y-5 pb-4">
      <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-white to-teal-500/5 p-4 shadow-sm dark:from-indigo-500/10 dark:via-slate-900 dark:to-teal-500/10">
        <div className="mb-1 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Investments & goals</h2>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Track FD / RD / SIP / Savings. Planned this month:{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {formatINR(plannedMonthly)}
          </span>
        </p>

        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <input
            value={invName}
            onChange={(e) => setInvName(e.target.value)}
            placeholder="Name (e.g. Nippon SIP)"
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40"
          />
          <input
            type="number"
            value={invAmt}
            onChange={(e) => setInvAmt(e.target.value)}
            placeholder="Monthly ₹"
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40"
          />
          <select
            value={invType}
            onChange={(e) => setInvType(e.target.value as InvestmentType)}
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40"
          >
            {INVESTMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={invGoal}
            onChange={(e) => setInvGoal(e.target.value as GoalTag)}
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40"
          >
            {GOAL_TAGS.map((g) => (
              <option key={g} value={g}>
                {GOAL_TAG_LABELS[g]}
              </option>
            ))}
          </select>
          {invGoal === 'custom' && (
            <input
              value={invCustomGoal}
              onChange={(e) => setInvCustomGoal(e.target.value)}
              placeholder="Custom goal label"
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-950/40"
            />
          )}
          <input
            value={invNotes}
            onChange={(e) => setInvNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-950/40"
          />
        </div>
        <button
          type="button"
          onClick={addInv}
          className="mb-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add investment
        </button>

        {investments.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-500">No investments yet.</p>
        ) : (
          <ul className="space-y-2">
            {investments.map((inv) => {
              const TypeIcon = INVESTMENT_TYPE_ICONS[inv.type]
              const GoalIcon = GOAL_TAG_ICONS[inv.goalTag]
              const goalLabel =
                inv.goalTag === 'custom' && inv.customGoal
                  ? inv.customGoal
                  : GOAL_TAG_LABELS[inv.goalTag]
              return (
                <li
                  key={inv.id}
                  className="rounded-xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-950/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{inv.name}</p>
                        <span className="shrink-0 text-sm font-bold tabular-nums">
                          {formatINR(inv.monthlyAmount)}/mo
                        </span>
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" /> {inv.type}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GoalIcon className="h-3 w-3" /> {goalLabel}
                        </span>
                      </p>
                      {inv.notes && (
                        <p className="mt-1 text-xs text-slate-500">{inv.notes}</p>
                      )}
                      <textarea
                        value={inv.progressNotes ?? ''}
                        onChange={(e) =>
                          onUpdateInvestment(inv.id, { progressNotes: e.target.value })
                        }
                        placeholder="Progress notes…"
                        rows={2}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-2 py-1.5 text-xs dark:border-slate-700"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteInvestment(inv.id)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-1 flex items-center gap-2">
          <Repeat className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold">Recurring expenses</h2>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Auto-posts once per month with id <code className="text-[10px]">recurring-&lt;id&gt;-YYYY-MM</code>.
        </p>

        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <input
            value={recName}
            onChange={(e) => setRecName(e.target.value)}
            placeholder="Name (e.g. Netflix)"
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          />
          <input
            type="number"
            value={recAmt}
            onChange={(e) => setRecAmt(e.target.value)}
            placeholder="Amount ₹"
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
          />
          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min={1}
              max={31}
              value={recDay}
              onChange={(e) => setRecDay(e.target.value)}
              placeholder="Day of month"
              className="w-full rounded-xl border border-slate-200 bg-transparent py-2 pl-9 pr-3 text-sm dark:border-slate-700"
            />
          </div>
          <CategorySelect
            value={recCat}
            onChange={setRecCat}
            customCategories={customCategories}
            className="w-full"
          />
        </div>
        <button
          type="button"
          onClick={addRec}
          className="mb-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add recurring
        </button>

        {recurrings.length === 0 ? (
          <p className="py-3 text-center text-xs text-slate-500">No recurring items.</p>
        ) : (
          <ul className="space-y-2">
            {recurrings.map((r) => {
              const Icon = getCategoryIcon(r.category, customCategories)
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-slate-800"
                >
                  <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {formatINR(r.amount)} · day {r.dayOfMonth} ·{' '}
                      {getCategoryLabel(r.category, customCategories)}
                      {!r.active && ' · paused'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateRecurring(r.id, { active: !r.active })}
                    className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {r.active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecurring(r.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
