import {
  BarChart3,
  LayoutDashboard,
  List,
  Settings,
  Target,
} from 'lucide-react'

export type TabId = 'dashboard' | 'transactions' | 'analytics' | 'plan' | 'settings'

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'transactions', label: 'Txns', icon: List },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'plan', label: 'Plan', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId
  onChange: (t: TabId) => void
}) {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-1 py-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium transition sm:text-[11px] ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
