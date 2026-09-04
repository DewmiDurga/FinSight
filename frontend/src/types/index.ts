export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Housing'
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Utilities'
  | 'Shopping'
  | 'Entertainment'
  | 'Health & Fitness'
  | 'Education'
  | 'Subscriptions'
  | 'Travel'
  | 'Miscellaneous';

export type PaymentAccount = 'Main Checking' | 'Savings Reserve' | 'Platinum Card' | 'Crypto Wallet' | 'Cash';

export interface Transaction {
  id: string;
  title: string;
  category: TransactionCategory;
  amount: number;
  type: TransactionType;
  date: string; // ISO date string YYYY-MM-DD
  account: PaymentAccount;
  status: 'completed' | 'pending' | 'flagged';
  note?: string;
  merchant?: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  color: string;
  icon: string;
  period: 'monthly' | 'yearly';
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StatMetric {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: number; // percentage e.g. 8.4 or -3.2
  isPositive: boolean;
  periodLabel: string;
  sparkline: number[];
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose';
}

export interface CashflowMonth {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface MerchantSpending {
  merchant: string;
  totalSpent: number;
  transactionCount: number;
  category: TransactionCategory;
  logoInitial: string;
  color: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: TransactionCategory;
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  metricsPreview?: {
    label: string;
    value: string;
    trend?: string;
  }[];
}

export type PageView = 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'assistant';

export interface DateFilterRange {
  label: string;
  value: '7d' | '30d' | 'this_month' | 'last_month' | 'ytd' | 'all';
}
