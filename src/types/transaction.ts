export type TxStatus = 'posted' | 'pending' | 'refunded' | 'reversed' | 'failed'
export type PaymentMethod =
  | 'upi'
  | 'credit_card'
  | 'debit_card'
  | 'emi'
  | 'bank_transfer'
  | 'cash_withdrawal'
  | 'other'

/** Built-in categories; Category also accepts custom string ids. */
export type BuiltinCategory =
  | 'food_dining'
  | 'petrol_fuel'
  | 'online_shopping'
  | 'shopping'
  | 'leisure'
  | 'travel'
  | 'bills_utilities'
  | 'emi'
  | 'healthcare'
  | 'groceries'
  | 'other'

export type Category = BuiltinCategory | (string & {})

export type Bank = 'HDFC' | 'ICICI' | 'HSBC' | 'SBI' | 'Axis' | 'Other'

export interface Transaction {
  id: string
  datetime: string
  amount: number
  merchant: string
  bank: Bank
  paymentMethod: PaymentMethod
  category: Category
  status: TxStatus
  source?: {
    provider: 'gmail' | 'zoho' | 'sample' | 'manual' | 'recurring'
    subject?: string
    messageId?: string
    snippet?: string
  }
}

export interface CategoryRule {
  merchantKey: string
  bank?: Bank
  category: Category
}

export interface Budget {
  monthlyLimit: number
  categoryLimits?: Partial<Record<string, number>>
}

export interface Incomes {
  balaMonthly: number
  wifeMonthly: number
}

export interface CustomCategory {
  id: string
  label: string
  /** lucide icon name key, e.g. "ShoppingBag" */
  icon: string
  color?: string
}

export interface RecurringExpense {
  id: string
  name: string
  amount: number
  category: Category
  dayOfMonth: number
  bank?: Bank
  paymentMethod?: PaymentMethod
  active: boolean
}

export type InvestmentType = 'FD' | 'RD' | 'SIP' | 'Savings Account'

export type GoalTag =
  | 'home_loan_preclose'
  | 'emergency_fund'
  | 'baby_expenses'
  | 'custom'

export interface Investment {
  id: string
  name: string
  type: InvestmentType
  monthlyAmount: number
  goalTag: GoalTag
  customGoal?: string
  notes?: string
  progressNotes?: string
  startedOn?: string
}

export interface AppState {
  transactions: Transaction[]
  categoryRules: CategoryRule[]
  budget: Budget
  lastSynced: string | null
  seeded: boolean
  incomes: Incomes
  customCategories: CustomCategory[]
  recurrings: RecurringExpense[]
  investments: Investment[]
}
