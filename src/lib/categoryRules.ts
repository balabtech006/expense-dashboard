import type { Bank, Category, CategoryRule, Transaction } from '../types/transaction'
import { normalizeMerchant } from './labels'

const FORCE_EMI_KEYS = new Set([
  normalizeMerchant('Acko General Insurance'),
  normalizeMerchant('Acko'),
  normalizeMerchant('ACKO GENERAL INSURANCE'),
])

export function isForcedEmiMerchant(merchant: string): boolean {
  const key = normalizeMerchant(merchant)
  if (FORCE_EMI_KEYS.has(key)) return true
  return key === 'acko' || key.startsWith('acko ')
}

export function findRule(
  rules: CategoryRule[],
  merchant: string,
  bank?: Bank
): CategoryRule | undefined {
  const key = normalizeMerchant(merchant)
  const withBank = bank
    ? rules.find((r) => r.merchantKey === key && r.bank === bank)
    : undefined
  if (withBank) return withBank
  return rules.find((r) => r.merchantKey === key && !r.bank)
}

export function applyRules(tx: Transaction, rules: CategoryRule[]): Transaction {
  if (isForcedEmiMerchant(tx.merchant)) {
    return { ...tx, category: 'emi' }
  }
  const rule = findRule(rules, tx.merchant, tx.bank)
  if (!rule) return tx
  return { ...tx, category: rule.category }
}

export function applyRulesToAll(
  transactions: Transaction[],
  rules: CategoryRule[]
): Transaction[] {
  return transactions.map((tx) => applyRules(tx, rules))
}

export function upsertRule(
  rules: CategoryRule[],
  merchant: string,
  category: Category,
  bank?: Bank
): CategoryRule[] {
  const finalCategory: Category = isForcedEmiMerchant(merchant) ? 'emi' : category
  const merchantKey = normalizeMerchant(merchant)
  const idx = rules.findIndex(
    (r) => r.merchantKey === merchantKey && (bank ? r.bank === bank : !r.bank)
  )
  const next: CategoryRule = {
    merchantKey,
    category: finalCategory,
    ...(bank ? { bank } : {}),
  }
  if (idx >= 0) {
    const copy = [...rules]
    copy[idx] = next
    return copy
  }
  return [...rules, next]
}

