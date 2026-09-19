import type { CategoryRule, Transaction } from '../types/transaction'
import { applyRules } from './categoryRules'

export interface SyncResult {
  added: number
  skipped: number
  transactions: Transaction[]
  lastSynced: string
}

/** Soft fingerprint: same calendar day + amount + normalized merchant ≈ same spend. */
export function softTxnKey(tx: Transaction): string {
  const day = (tx.datetime || '').slice(0, 10)
  const amt = Math.round(Number(tx.amount) * 100) / 100
  const merchant = (tx.merchant || '').toLowerCase().replace(/\s+/g, ' ').trim()
  return `${day}|${amt}|${merchant}`
}

function parseJsonl(text: string): Transaction[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const txs: Transaction[] = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line) as Transaction
      if (obj.id && obj.datetime && typeof obj.amount === 'number' && obj.merchant) {
        txs.push(obj)
      }
    } catch {
      // skip
    }
  }
  return txs
}

export async function fetchInboxTransactions(): Promise<Transaction[]> {
  const res = await fetch(`/inbox/transactions.jsonl?t=${Date.now()}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Failed to fetch inbox: ${res.status}`)
  return parseJsonl(await res.text())
}

export function mergeTransactions(
  existing: Transaction[],
  incoming: Transaction[],
  rules: CategoryRule[]
): SyncResult {
  const ids = new Set(existing.map((t) => t.id))
  const soft = new Set(existing.map(softTxnKey))
  let added = 0
  let skipped = 0
  const merged = [...existing]
  for (const raw of incoming) {
    const key = softTxnKey(raw)
    if (ids.has(raw.id) || soft.has(key)) {
      skipped += 1
      continue
    }
    merged.push(applyRules(raw, rules))
    ids.add(raw.id)
    soft.add(key)
    added += 1
  }
  merged.sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  )
  return {
    added,
    skipped,
    transactions: merged,
    lastSynced: new Date().toISOString(),
  }
}

/** Keep earliest occurrence per id and per soft key (day+amount+merchant). */
export function dedupeTransactions(transactions: Transaction[]): {
  transactions: Transaction[]
  removed: number
} {
  const seenIds = new Set<string>()
  const seenSoft = new Set<string>()
  const out: Transaction[] = []
  let removed = 0
  const ordered = [...transactions].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  )
  for (const tx of ordered) {
    const soft = softTxnKey(tx)
    if (seenIds.has(tx.id) || seenSoft.has(soft)) {
      removed += 1
      continue
    }
    seenIds.add(tx.id)
    seenSoft.add(soft)
    out.push(tx)
  }
  out.sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  )
  return { transactions: out, removed }
}
