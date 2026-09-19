import { format, parseISO } from 'date-fns'
import { Moon, RefreshCw, Sun, Wallet } from 'lucide-react'

export function Header({
  lastSynced,
  syncing,
  onSync,
  dark,
  onToggleTheme,
  syncMessage,
}: {
  lastSynced: string | null
  syncing: boolean
  onSync: () => void
  dark: boolean
  onToggleTheme: () => void
  syncMessage: string | null
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-400 text-white shadow-lg shadow-indigo-500/25">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-lg">
              Bala Monthly Expenses Tracker
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lastSynced
                ? `Last synced ${format(parseISO(lastSynced), 'd MMM · HH:mm')} IST`
                : 'Not synced yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>
      {syncMessage && (
        <div className="border-t border-indigo-500/20 bg-indigo-50 px-4 py-1.5 text-center text-xs text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          {syncMessage}
        </div>
      )}
    </header>
  )
}
