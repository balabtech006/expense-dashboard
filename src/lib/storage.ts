import type {
  AppState,
  Budget,
  CategoryRule,
  Incomes,
  Transaction,
} from '../types/transaction'
import { normalizeMerchant } from './labels'

export type { AppState, Budget, CategoryRule, Transaction }

const STORAGE_KEY = 'spend-dashboard-v7'

const DEFAULT_BUDGET: Budget = {
  monthlyLimit: 160_000,
  categoryLimits: {
    emi: 90_000,
    food_dining: 10_000,
    online_shopping: 5_000,
    bills_utilities: 4_000,
    petrol_fuel: 5_000,
    groceries: 10_000,
    leisure: 2_000,
    other: 34_000,
  },
}

const DEFAULT_INCOMES: Incomes = {
  balaMonthly: 0,
  wifeMonthly: 0,
}

export const DEFAULT_CATEGORY_RULES: CategoryRule[] = [
  { merchantKey: normalizeMerchant('Acko General Insurance'), category: 'emi' },
  { merchantKey: normalizeMerchant('Acko'), category: 'emi' },
]

export const DEFAULT_STATE: AppState = {
  transactions: [],
  categoryRules: DEFAULT_CATEGORY_RULES,
  budget: DEFAULT_BUDGET,
  lastSynced: null,
  seeded: false,
  incomes: DEFAULT_INCOMES,
  customCategories: [],
  recurrings: [],
  investments: [],
}

function cloneDefaults(): AppState {
  return {
    ...DEFAULT_STATE,
    budget: {
      ...DEFAULT_BUDGET,
      categoryLimits: { ...DEFAULT_BUDGET.categoryLimits },
    },
    incomes: { ...DEFAULT_INCOMES },
    categoryRules: [...DEFAULT_CATEGORY_RULES],
    customCategories: [],
    recurrings: [],
    investments: [],
  }
}

function mergeAckoRules(rules: CategoryRule[]): CategoryRule[] {
  const next = [...rules]
  for (const def of DEFAULT_CATEGORY_RULES) {
    const idx = next.findIndex((r) => r.merchantKey === def.merchantKey && !r.bank)
    if (idx >= 0) next[idx] = { ...next[idx], category: 'emi' }
    else next.push({ ...def })
  }
  return next
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneDefaults()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...cloneDefaults(),
      ...parsed,
      budget: {
        ...DEFAULT_BUDGET,
        ...parsed.budget,
        categoryLimits: {
          ...DEFAULT_BUDGET.categoryLimits,
          ...parsed.budget?.categoryLimits,
        },
      },
      incomes: { ...DEFAULT_INCOMES, ...parsed.incomes },
      transactions: parsed.transactions ?? [],
      categoryRules: mergeAckoRules(parsed.categoryRules ?? []),
      customCategories: parsed.customCategories ?? [],
      recurrings: parsed.recurrings ?? [],
      investments: parsed.investments ?? [],
    }
  } catch {
    return cloneDefaults()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
