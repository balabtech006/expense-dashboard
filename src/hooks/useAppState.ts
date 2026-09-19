import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  Budget,
  Category,
  CustomCategory,
  Incomes,
  Investment,
  RecurringExpense,
} from '../types/transaction'
import { SEED_TRANSACTIONS } from '../data/seedTransactions'
import { loadState, saveState, type AppState } from '../lib/storage'
import { applyRulesToAll, upsertRule } from '../lib/categoryRules'
import { dedupeTransactions, fetchInboxTransactions, mergeTransactions } from '../lib/sync'
import { ensureRecurringTransactions } from '../lib/recurring'
import { slugifyCategoryId } from '../lib/labels'

export const APP_NOW = new Date('2026-09-18T15:00:00+05:30')

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!state.seeded) {
      let transactions = applyRulesToAll(SEED_TRANSACTIONS, state.categoryRules).sort(
        (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      )
      const rec = ensureRecurringTransactions(transactions, state.recurrings, APP_NOW)
      transactions = dedupeTransactions(rec.transactions).transactions
      const seeded: AppState = { ...state, transactions, seeded: true }
      saveState(seeded)
      setState(seeded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.seeded) saveState(state)
  }, [state])

  // Soft-dedupe existing browser storage (e.g. Pratheba EMI listed twice).
  useEffect(() => {
    if (!state.seeded) return
    setState((prev) => {
      const { transactions, removed } = dedupeTransactions(prev.transactions)
      if (removed === 0) return prev
      return { ...prev, transactions }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.seeded])

  useEffect(() => {
    if (!state.seeded) return
    let cancelled = false
    ;(async () => {
      try {
        const incoming = await fetchInboxTransactions()
        if (cancelled || incoming.length === 0) return
        setState((prev) => {
          const result = mergeTransactions(prev.transactions, incoming, prev.categoryRules)
          const deduped = dedupeTransactions(result.transactions)
          const withRec = ensureRecurringTransactions(
            deduped.transactions,
            prev.recurrings,
            APP_NOW
          )
          if (result.added === 0 && withRec.added === 0) return prev
          return {
            ...prev,
            transactions: withRec.transactions,
            lastSynced: result.lastSynced,
          }
        })
      } catch {
        // inbox optional
      }
    })()
    return () => {
      cancelled = true
    }
  }, [state.seeded])

  useEffect(() => {
    if (!state.seeded) return
    setState((prev) => {
      const withRec = ensureRecurringTransactions(prev.transactions, prev.recurrings, APP_NOW)
      if (withRec.added === 0) return prev
      return { ...prev, transactions: withRec.transactions }
    })
  }, [state.seeded, state.recurrings])

  const updateCategory = useCallback((id: string, category: Category) => {
    setState((prev) => {
      const tx = prev.transactions.find((t) => t.id === id)
      if (!tx) return prev
      const rules = upsertRule(prev.categoryRules, tx.merchant, category, tx.bank)
      const transactions = applyRulesToAll(
        prev.transactions.map((t) => {
          if (t.id === id) return { ...t, category }
          if (
            t.merchant.toLowerCase() === tx.merchant.toLowerCase() &&
            t.bank === tx.bank
          ) {
            return { ...t, category }
          }
          return t
        }),
        rules
      )
      return { ...prev, transactions, categoryRules: rules }
    })
  }, [])

  const sync = useCallback(async () => {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const incoming = await fetchInboxTransactions()
      setState((prev) => {
        const result = mergeTransactions(prev.transactions, incoming, prev.categoryRules)
        const deduped = dedupeTransactions(result.transactions)
        const withRec = ensureRecurringTransactions(
          deduped.transactions,
          prev.recurrings,
          APP_NOW
        )
        setSyncMessage(
          result.added > 0
            ? `Synced ${result.added} new · ${result.skipped} duplicates`
            : result.skipped > 0
              ? `Already up to date (${result.skipped} known)`
              : 'Inbox empty — nothing new'
        )
        return {
          ...prev,
          transactions: withRec.transactions,
          lastSynced: result.lastSynced,
        }
      })
    } catch (e) {
      setSyncMessage(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }, [])

  const clearSyncMessage = useCallback(() => setSyncMessage(null), [])

  const setBudget = useCallback((budget: Budget) => {
    setState((p) => ({ ...p, budget }))
  }, [])

  const setIncomes = useCallback((incomes: Incomes) => {
    setState((p) => ({ ...p, incomes }))
  }, [])

  const addCustomCategory = useCallback((label: string, icon: string, color?: string) => {
    setState((p) => {
      let id = slugifyCategoryId(label)
      const existing = new Set([
        ...p.customCategories.map((c) => c.id),
        'food_dining',
        'petrol_fuel',
        'online_shopping',
        'shopping',
        'leisure',
        'travel',
        'bills_utilities',
        'emi',
        'healthcare',
        'groceries',
        'other',
      ])
      if (existing.has(id)) id = `${id}_${Date.now().toString(36)}`
      const cat: CustomCategory = { id, label, icon, color }
      return { ...p, customCategories: [...p.customCategories, cat] }
    })
  }, [])

  const removeCustomCategory = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      customCategories: p.customCategories.filter((c) => c.id !== id),
      transactions: p.transactions.map((t) =>
        t.category === id ? { ...t, category: 'other' } : t
      ),
    }))
  }, [])

  const addRecurring = useCallback(
    (item: Omit<RecurringExpense, 'id' | 'active'> & { active?: boolean }) => {
      setState((p) => {
        const id = `rec-${Date.now().toString(36)}`
        const rec: RecurringExpense = {
          id,
          name: item.name,
          amount: item.amount,
          category: item.category,
          dayOfMonth: item.dayOfMonth,
          bank: item.bank,
          paymentMethod: item.paymentMethod,
          active: item.active ?? true,
        }
        const recurrings = [...p.recurrings, rec]
        const withRec = ensureRecurringTransactions(p.transactions, recurrings, APP_NOW)
        return { ...p, recurrings, transactions: withRec.transactions }
      })
    },
    []
  )

  const updateRecurring = useCallback((id: string, patch: Partial<RecurringExpense>) => {
    setState((p) => {
      const recurrings = p.recurrings.map((r) => (r.id === id ? { ...r, ...patch } : r))
      const withRec = ensureRecurringTransactions(p.transactions, recurrings, APP_NOW)
      return { ...p, recurrings, transactions: withRec.transactions }
    })
  }, [])

  const deleteRecurring = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      recurrings: p.recurrings.filter((r) => r.id !== id),
    }))
  }, [])

  const addInvestment = useCallback((item: Omit<Investment, 'id'>) => {
    setState((p) => ({
      ...p,
      investments: [...p.investments, { ...item, id: `inv-${Date.now().toString(36)}` }],
    }))
  }, [])

  const updateInvestment = useCallback((id: string, patch: Partial<Investment>) => {
    setState((p) => ({
      ...p,
      investments: p.investments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }))
  }, [])

  const deleteInvestment = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      investments: p.investments.filter((i) => i.id !== id),
    }))
  }, [])


  const deleteTransaction = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      transactions: p.transactions.filter((t) => t.id !== id),
    }))
  }, [])

  const removeDuplicateTransactions = useCallback(() => {
    let removed = 0
    setState((p) => {
      const result = dedupeTransactions(p.transactions)
      removed = result.removed
      if (result.removed === 0) return p
      return { ...p, transactions: result.transactions }
    })
    return removed
  }, [])

  const transactions = useMemo(() => state.transactions, [state.transactions])

  return {
    transactions,
    budget: state.budget,
    incomes: state.incomes,
    customCategories: state.customCategories,
    recurrings: state.recurrings,
    investments: state.investments,
    lastSynced: state.lastSynced,
    categoryRules: state.categoryRules,
    updateCategory,
    deleteTransaction,
    removeDuplicateTransactions,
    sync,
    syncing,
    syncMessage,
    clearSyncMessage,
    setBudget,
    setIncomes,
    addCustomCategory,
    removeCustomCategory,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  }
}
