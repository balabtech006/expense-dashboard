import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string
  value: string
  sub?: string
  accent?: 'indigo' | 'teal' | 'rose' | 'amber'
  icon?: ReactNode
}) {
  const ring =
    accent === 'teal'
      ? 'from-teal-500/20 to-cyan-500/5 border-teal-500/20'
      : accent === 'rose'
        ? 'from-rose-500/20 to-orange-500/5 border-rose-500/20'
        : accent === 'amber'
          ? 'from-amber-500/25 to-yellow-500/5 border-amber-500/25'
          : 'from-indigo-500/20 to-violet-500/5 border-indigo-500/20'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${ring} bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-900/80`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-white/60 p-2 text-indigo-600 dark:bg-slate-800/60 dark:text-indigo-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
