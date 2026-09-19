import type { LucideIcon } from 'lucide-react'
import {
  UtensilsCrossed,
  Fuel,
  ShoppingCart,
  ShoppingBag,
  Gamepad2,
  Plane,
  Receipt,
  Landmark,
  HeartPulse,
  Carrot,
  MoreHorizontal,
  Wallet,
  PiggyBank,
  TrendingUp,
  Building2,
  Baby,
  Home,
  Shield,
  Repeat,
  Sparkles,
  IndianRupee,
  Target,
  CalendarClock,
  Tag,
} from 'lucide-react'
import type {
  BuiltinCategory,
  Category,
  CustomCategory,
  GoalTag,
  InvestmentType,
  PaymentMethod,
  TxStatus,
  Bank,
} from '../types/transaction'

export const BUILTIN_CATEGORIES: BuiltinCategory[] = [
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
]

export const CATEGORY_LABELS: Record<BuiltinCategory, string> = {
  food_dining: 'Food & Dining',
  petrol_fuel: 'Petrol & Fuel',
  online_shopping: 'Online Shopping',
  shopping: 'Shopping',
  leisure: 'Leisure',
  travel: 'Travel',
  bills_utilities: 'Bills & Utilities',
  emi: 'EMI',
  healthcare: 'Healthcare',
  groceries: 'Groceries',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<BuiltinCategory, string> = {
  food_dining: '#f97316',
  petrol_fuel: '#eab308',
  online_shopping: '#a855f7',
  shopping: '#ec4899',
  leisure: '#06b6d4',
  travel: '#3b82f6',
  bills_utilities: '#64748b',
  emi: '#ef4444',
  healthcare: '#22c55e',
  groceries: '#84cc16',
  other: '#94a3b8',
}

export const CATEGORY_ICONS: Record<BuiltinCategory, LucideIcon> = {
  food_dining: UtensilsCrossed,
  petrol_fuel: Fuel,
  online_shopping: ShoppingCart,
  shopping: ShoppingBag,
  leisure: Gamepad2,
  travel: Plane,
  bills_utilities: Receipt,
  emi: Landmark,
  healthcare: HeartPulse,
  groceries: Carrot,
  other: MoreHorizontal,
}

export const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Fuel,
  ShoppingCart,
  ShoppingBag,
  Gamepad2,
  Plane,
  Receipt,
  Landmark,
  HeartPulse,
  Carrot,
  MoreHorizontal,
  Wallet,
  PiggyBank,
  TrendingUp,
  Building2,
  Baby,
  Home,
  Shield,
  Repeat,
  Sparkles,
  IndianRupee,
  Target,
  CalendarClock,
  Tag,
}

export const CUSTOM_ICON_OPTIONS = [
  'Tag',
  'ShoppingBag',
  'Wallet',
  'PiggyBank',
  'Baby',
  'Home',
  'Shield',
  'HeartPulse',
  'Plane',
  'Gamepad2',
  'Carrot',
  'Receipt',
] as const

export const GOAL_TAG_LABELS: Record<GoalTag, string> = {
  home_loan_preclose: 'Home loan preclose',
  emergency_fund: 'Emergency fund',
  baby_expenses: 'Baby expenses',
  custom: 'Custom',
}

export const GOAL_TAG_ICONS: Record<GoalTag, LucideIcon> = {
  home_loan_preclose: Home,
  emergency_fund: Shield,
  baby_expenses: Baby,
  custom: Target,
}

export const INVESTMENT_TYPE_ICONS: Record<InvestmentType, LucideIcon> = {
  FD: Building2,
  RD: PiggyBank,
  SIP: TrendingUp,
  'Savings Account': Wallet,
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  emi: 'EMI',
  bank_transfer: 'Bank Transfer',
  cash_withdrawal: 'Cash Withdrawal',
  other: 'Other',
}

export const STATUS_LABELS: Record<TxStatus, string> = {
  posted: 'Posted',
  pending: 'Pending',
  refunded: 'Refunded',
  reversed: 'Reversed',
  failed: 'Failed',
}

export const STATUS_STYLES: Record<TxStatus, string> = {
  posted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  refunded: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  reversed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

export const BANKS: Bank[] = ['HDFC', 'ICICI', 'HSBC', 'SBI', 'Axis', 'Other']
export const CATEGORIES = BUILTIN_CATEGORIES
export const PAYMENT_METHODS = Object.keys(PAYMENT_LABELS) as PaymentMethod[]

export function isBuiltinCategory(c: string): c is BuiltinCategory {
  return (BUILTIN_CATEGORIES as string[]).includes(c)
}

export function getCategoryLabel(
  category: Category,
  customCategories: CustomCategory[] = []
): string {
  if (isBuiltinCategory(category)) return CATEGORY_LABELS[category]
  return customCategories.find((c) => c.id === category)?.label ?? category
}

export function getCategoryColor(
  category: Category,
  customCategories: CustomCategory[] = []
): string {
  if (isBuiltinCategory(category)) return CATEGORY_COLORS[category]
  return customCategories.find((c) => c.id === category)?.color ?? '#6366f1'
}

export function getCategoryIcon(
  category: Category,
  customCategories: CustomCategory[] = []
): LucideIcon {
  if (isBuiltinCategory(category)) return CATEGORY_ICONS[category]
  const custom = customCategories.find((c) => c.id === category)
  if (custom?.icon && ICON_MAP[custom.icon]) return ICON_MAP[custom.icon]
  return Tag
}

export function allCategoryOptions(
  customCategories: CustomCategory[] = []
): { id: Category; label: string }[] {
  return [
    ...BUILTIN_CATEGORIES.map((id) => ({ id: id as Category, label: CATEGORY_LABELS[id] })),
    ...customCategories.map((c) => ({ id: c.id as Category, label: c.label })),
  ]
}

export function formatINR(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: abs >= 100 ? 0 : 2,
  }).format(abs)
  return amount < 0 ? `−${formatted}` : formatted
}

export function formatCompactINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`
  return formatINR(amount)
}

export function normalizeMerchant(merchant: string): string {
  return merchant
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function slugifyCategoryId(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)
  return base || `custom_${Date.now()}`
}

/** Aliases for alternate naming used across UI */
