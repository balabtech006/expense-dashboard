import { useCallback, useEffect, useState } from 'react'
import type { Category, Transaction } from './types/transaction'
import { useAppState } from './hooks/useAppState'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { BottomNav, type TabId } from './components/BottomNav'
import { Dashboard } from './components/Dashboard'
import { Transactions } from './components/Transactions'
import { Analytics } from './components/Analytics'
import { Plan } from './components/Plan'
import { Settings } from './components/Settings'
import { CategorySelect } from './components/CategorySelect'
import { formatINR } from './lib/labels'
import { X } from 'lucide-react'

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard')
  const { dark, toggle } = useTheme()
  const {
    transactions,
    budget,
    incomes,
    customCategories,
    recurrings,
    investments,
    lastSynced,
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
  } = useAppState()

  const [editing, setEditing] = useState<Transaction | null>(null)

  useEffect(() => {
    if (!syncMessage) return
    const t = setTimeout(clearSyncMessage, 4000)
    return () => clearTimeout(t)
  }, [syncMessage, clearSyncMessage])

  const onEditCategory = useCallback((tx: Transaction) => {
    setEditing(tx)
  }, [])

  const handleCategoryChange = useCallback(
    (c: Category) => {
      if (!editing) return
      updateCategory(editing.id, c)
      setEditing({ ...editing, category: c })
    },
    [editing, updateCategory]
  )

  return (
    <div className="mx-auto min-h-dvh max-w-3xl">
      <Header
        lastSynced={lastSynced}
        syncing={syncing}
        onSync={sync}
        dark={dark}
        onToggleTheme={toggle}
        syncMessage={syncMessage}
      />

      <main className="px-4 pb-24 pt-4">
        {tab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            budget={budget}
            incomes={incomes}
            investments={investments}
            customCategories={customCategories}
            onEditCategory={onEditCategory}
          />
        )}
        {tab === 'transactions' && (
          <Transactions
            transactions={transactions}
            onUpdateCategory={updateCategory}
            onDeleteTransaction={deleteTransaction}
            onRemoveDuplicates={removeDuplicateTransactions}
          />
        )}
        {tab === 'analytics' && (
          <Analytics
            transactions={transactions}
            budget={budget}
                        onEditCategory={onEditCategory}
          />
        )}
        {tab === 'plan' && (
          <Plan
            recurrings={recurrings}
            investments={investments}
            customCategories={customCategories}
            onAddRecurring={addRecurring}
            onUpdateRecurring={updateRecurring}
            onDeleteRecurring={deleteRecurring}
            onAddInvestment={addInvestment}
            onUpdateInvestment={updateInvestment}
            onDeleteInvestment={deleteInvestment}
          />
        )}
        {tab === 'settings' && (
          <Settings
            incomes={incomes}
            budget={budget}
            customCategories={customCategories}
            onSetIncomes={setIncomes}
            onSetBudget={setBudget}
            onAddCategory={addCustomCategory}
            onRemoveCategory={removeCustomCategory}
          />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {editing && tab !== 'transactions' && (
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
              onChange={handleCategoryChange}
              customCategories={customCategories}
              className="w-full"
            />
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
