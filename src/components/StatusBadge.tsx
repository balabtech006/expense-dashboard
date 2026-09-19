import type { TxStatus } from '../types/transaction'
import { STATUS_LABELS, STATUS_STYLES } from '../lib/labels'

export function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
