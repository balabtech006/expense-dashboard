import { useState } from 'react'
import {
  IndianRupee,
  PiggyBank,
  Plus,
  Tag,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react'
import type { Budget, CustomCategory, Incomes } from '../types/transaction'
import {
  CUSTOM_ICON_OPTIONS,
  ICON_MAP,
  formatINR,
} from '../lib/labels'
import { householdIncome } from '../lib/insights'

export function Settings({
  incomes,
  budget,
  customCategories,
  onSetIncomes,
  onSetBudget,
  onAddCategory,
  onRemoveCategory,
}: {
  incomes: Incomes
  budget: Budget
  customCategories: CustomCategory[]
  onSetIncomes: (i: Incomes) => void
  onSetBudget: (b: Budget) => void
  onAddCategory: (label: string, icon: string, color?: string) => void
  onRemoveCategory: (id: string) => void
}) {
  const [bala, setBala] = useState(String(incomes.balaMonthly || ''))
  const [wife, setWife] = useState(String(incomes.wifeMonthly || ''))
  const [limit, setLimit] = useState(String(budget.monthlyLimit || ''))
  const [newLabel, setNewLabel] = useState('')
  const [newIcon, setNewIcon] = useState<string>('Tag')
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const flash = (msg: string) => {
    setSavedMsg(msg)
    setTimeout(() => setSavedMsg(null), 2000)
  }

  const saveIncomes = () => {
    onSetIncomes({
      balaMonthly: Number(bala) || 0,
      wifeMonthly: Number(wife) || 0,
    })
    flash('Salaries saved')
  }

  const saveBudget = () => {
    const monthlyLimit = Number(limit) || 0
    onSetBudget({ ...budget, monthlyLimit })
    flash('Budget saved')
  }

  const addCat = () => {
    const label = newLabel.trim()
    if (!label) return
    onAddCategory(label, newIcon)
    setNewLabel('')
    flash('Category added')
  }

  const combined = householdIncome({
    balaMonthly: Number(bala) || incomes.balaMonthly,
    wifeMonthly: Number(wife) || incomes.wifeMonthly,
  })

  return (
    <div className="space-y-5 pb-4">
      {savedMsg && (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {savedMsg}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            <Users className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold">Household salaries</h2>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Monthly take-home for Bala and spouse. Used for leftover insight on Home.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-500">
            Bala's salary
            <div className="relative mt-1">
              <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                inputMode="numeric"
                value={bala}
                onChange={(e) => setBala(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-9 pr-3 text-sm dark:border-slate-700"
              />
            </div>
          </label>
          <label className="block text-xs font-medium text-slate-500">
            Wife's salary
            <div className="relative mt-1">
              <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                inputMode="numeric"
                value={wife}
                onChange={(e) => setWife(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-9 pr-3 text-sm dark:border-slate-700"
              />
            </div>
          </label>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Wallet className="h-3.5 w-3.5" /> Combined household
          </span>
          <span className="text-sm font-bold tabular-nums">{formatINR(combined)}</span>
        </div>
        <button
          type="button"
          onClick={saveIncomes}
          className="mt-3 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
        >
          Save salaries
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-teal-100 p-1.5 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300">
            <PiggyBank className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold">Monthly budget</h2>
        </div>
        <label className="block text-xs font-medium text-slate-500">
          Total monthly limit
          <div className="relative mt-1">
            <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              inputMode="numeric"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-transparent py-2.5 pl-9 pr-3 text-sm dark:border-slate-700"
            />
          </div>
        </label>
        <p className="mt-2 text-xs text-slate-500">
          Current: {formatINR(budget.monthlyLimit)} · Analytics & Home budget bars use this.
        </p>
        <button
          type="button"
          onClick={saveBudget}
          className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white"
        >
          Save budget
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-lg bg-violet-100 p-1.5 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
            <Tag className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold">Custom categories</h2>
        </div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Category name"
            className="flex-1 rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700"
          />
          <select
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700"
          >
            {CUSTOM_ICON_OPTIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCat}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {customCategories.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-4">
            No custom categories yet. Add one to track niche spends with %.
          </p>
        ) : (
          <ul className="space-y-2">
            {customCategories.map((c) => {
              const Icon = ICON_MAP[c.icon] ?? Tag
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-800"
                >
                  <div className="rounded-lg bg-violet-100 p-1.5 text-violet-600 dark:bg-violet-900/40">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.label}</p>
                    <p className="text-[11px] text-slate-500">{c.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveCategory(c.id)}
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    aria-label="Delete category"
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
