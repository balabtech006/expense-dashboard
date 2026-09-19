import { useState } from 'react'
import {
  CalendarClock,
  Plus,
  Repeat,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import type {
  Category,
  CustomCategory,
  GoalTag,
  Investment,
  InvestmentType,
  RecurringExpense,
} from '../types/transaction'
import {
  CategorySelect,
} from './CategorySelect'
import {
  GOAL_TAG_ICONS,
  GOAL_TAG_LABELS,
  INVESTMENT_TYPE_ICONS,
  getCategoryIcon,
  getCategoryLabel,
  formatINR,
} from '../lib/labels'

const INVESTMENT_TYPES: InvestmentType[] = ['FD', 'RD', 'SIP', 'Savings Account']
const GOAL_TAGS: GoalTag[] = [
  'home_loan_preclose',
  'emergency_fund',
  'baby_expenses',
  'custom',
]

export function Plan(props: any) {
  return <div className="p-4">Plan placeholder - uploading full file next</div>
}
