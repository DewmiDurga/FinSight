import type {
  Transaction,
  Budget,
  Goal,
  CashflowMonth,
  MerchantSpending,
  SubscriptionItem,
  ChatMessage,
  CategoryBreakdown
} from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Acme Corp Tech Salary',
    category: 'Salary',
    amount: 6450.00,
    type: 'income',
    date: '2026-09-01',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Acme Corp',
    note: 'Bi-weekly direct deposit'
  },
  {
    id: 'tx-2',
    title: 'Skyline Luxury Apartments',
    category: 'Housing',
    amount: 1950.00,
    type: 'expense',
    date: '2026-09-02',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Skyline Properties',
    note: 'Monthly rent payment'
  },
  {
    id: 'tx-3',
    title: 'Whole Foods Market',
    category: 'Groceries',
    amount: 164.20,
    type: 'expense',
    date: '2026-09-02',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Whole Foods',
    note: 'Organic groceries & weekly essentials'
  },
  {
    id: 'tx-4',
    title: 'UI/UX Design Contract',
    category: 'Freelance',
    amount: 1200.00,
    type: 'income',
    date: '2026-08-30',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Starlight Studio',
    note: 'Design sprint milestone 2'
  },
  {
    id: 'tx-5',
    title: 'Apple Developer & iCloud Sub',
    category: 'Subscriptions',
    amount: 32.99,
    type: 'expense',
    date: '2026-08-29',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Apple',
    note: 'Annual cloud storage + dev license'
  },
  {
    id: 'tx-6',
    title: 'Sushi Omakase Lounge',
    category: 'Food & Dining',
    amount: 142.50,
    type: 'expense',
    date: '2026-08-28',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Sushi Omakase',
    note: 'Dinner celebration'
  },
  {
    id: 'tx-7',
    title: 'Tesla Supercharger',
    category: 'Transportation',
    amount: 28.40,
    type: 'expense',
    date: '2026-08-27',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Tesla Motors',
    note: 'Highway fast charge'
  },
  {
    id: 'tx-8',
    title: 'Vanguard S&P 500 Index Div',
    category: 'Investments',
    amount: 235.80,
    type: 'income',
    date: '2026-08-25',
    account: 'Savings Reserve',
    status: 'completed',
    merchant: 'Vanguard',
    note: 'Quarterly dividend reinvestment'
  },
  {
    id: 'tx-9',
    title: 'Equinox Gym & Spa',
    category: 'Health & Fitness',
    amount: 210.00,
    type: 'expense',
    date: '2026-08-24',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'Equinox',
    note: 'Monthly fitness membership'
  },
  {
    id: 'tx-10',
    title: 'Pacific Power & Light',
    category: 'Utilities',
    amount: 88.35,
    type: 'expense',
    date: '2026-08-22',
    account: 'Main Checking',
    status: 'completed',
    merchant: 'PGE',
    note: 'Electric bill'
  },
  {
    id: 'tx-11',
    title: 'Amazon Prime Purchases',
    category: 'Shopping',
    amount: 115.90,
    type: 'expense',
    date: '2026-08-20',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Amazon',
    note: 'Desk accessories & books'
  },
  {
    id: 'tx-12',
    title: 'Blue Bottle Coffee',
    category: 'Food & Dining',
    amount: 14.80,
    type: 'expense',
    date: '2026-08-19',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Blue Bottle Coffee'
  },
  {
    id: 'tx-13',
    title: 'Netflix 4K Premium',
    category: 'Subscriptions',
    amount: 22.99,
    type: 'expense',
    date: '2026-08-18',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Netflix'
  },
  {
    id: 'tx-14',
    title: 'Spotify Family Plan',
    category: 'Subscriptions',
    amount: 19.99,
    type: 'expense',
    date: '2026-08-16',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Spotify'
  },
  {
    id: 'tx-15',
    title: 'Delta Air Lines Flight Booking',
    category: 'Travel',
    amount: 480.00,
    type: 'expense',
    date: '2026-08-14',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Delta Airlines',
    note: 'Flight tickets for autumn retreat'
  },
  {
    id: 'tx-16',
    title: 'Trader Joe\'s Groceries',
    category: 'Groceries',
    amount: 92.45,
    type: 'expense',
    date: '2026-08-12',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Trader Joe\'s'
  },
  {
    id: 'tx-17',
    title: 'Ethereum Staking Reward',
    category: 'Investments',
    amount: 85.20,
    type: 'income',
    date: '2026-08-10',
    account: 'Crypto Wallet',
    status: 'completed',
    merchant: 'Lido Protocol'
  },
  {
    id: 'tx-18',
    title: 'Nordstrom Designer Apparel',
    category: 'Shopping',
    amount: 245.00,
    type: 'expense',
    date: '2026-08-08',
    account: 'Platinum Card',
    status: 'completed',
    merchant: 'Nordstrom'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    category: 'Housing',
    limit: 2200,
    spent: 1950,
    color: '#06b6d4', // cyan
    icon: 'Home',
    period: 'monthly'
  },
  {
    id: 'b-2',
    category: 'Food & Dining',
    limit: 600,
    spent: 420,
    color: '#f59e0b', // amber
    icon: 'Utensils',
    period: 'monthly'
  },
  {
    id: 'b-3',
    category: 'Groceries',
    limit: 500,
    spent: 256.65,
    color: '#10b981', // emerald
    icon: 'ShoppingBag',
    period: 'monthly'
  },
  {
    id: 'b-4',
    category: 'Transportation',
    limit: 250,
    spent: 185.40,
    color: '#3b82f6', // blue
    icon: 'Car',
    period: 'monthly'
  },
  {
    id: 'b-5',
    category: 'Shopping',
    limit: 450,
    spent: 475.00, // slightly exceeded to showcase warning
    color: '#f43f5e', // rose
    icon: 'Tag',
    period: 'monthly'
  },
  {
    id: 'b-6',
    category: 'Subscriptions',
    limit: 120,
    spent: 75.97,
    color: '#8b5cf6', // violet
    icon: 'Tv',
    period: 'monthly'
  },
  {
    id: 'b-7',
    category: 'Health & Fitness',
    limit: 300,
    spent: 210.00,
    color: '#14b8a6', // teal
    icon: 'Activity',
    period: 'monthly'
  },
  {
    id: 'b-8',
    category: 'Utilities',
    limit: 200,
    spent: 88.35,
    color: '#eab308', // yellow
    icon: 'Zap',
    period: 'monthly'
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'Emergency Safety Cushion',
    targetAmount: 20000,
    currentAmount: 16450,
    deadline: '2026-12-31',
    category: 'Safety',
    color: '#10b981',
    icon: 'ShieldCheck',
    priority: 'high'
  },
  {
    id: 'g-2',
    title: 'Kyoto Autumn Journey',
    targetAmount: 4500,
    currentAmount: 3350,
    deadline: '2026-10-15',
    category: 'Travel',
    color: '#06b6d4',
    icon: 'Plane',
    priority: 'medium'
  },
  {
    id: 'g-3',
    title: 'Home Down Payment Fund',
    targetAmount: 60000,
    currentAmount: 28900,
    deadline: '2027-06-30',
    category: 'Real Estate',
    color: '#8b5cf6',
    icon: 'Building2',
    priority: 'high'
  },
  {
    id: 'g-4',
    title: 'M3 Max Studio Workstation',
    targetAmount: 3800,
    currentAmount: 2950,
    deadline: '2026-11-20',
    category: 'Tech',
    color: '#f59e0b',
    icon: 'Laptop',
    priority: 'low'
  }
];

export const CASHFLOW_HISTORY: CashflowMonth[] = [
  { month: 'Apr', income: 7200, expenses: 4350, savings: 2850 },
  { month: 'May', income: 7650, expenses: 4620, savings: 3030 },
  { month: 'Jun', income: 8100, expenses: 4890, savings: 3210 },
  { month: 'Jul', income: 7850, expenses: 4210, savings: 3640 },
  { month: 'Aug', income: 7971, expenses: 3600, savings: 4371 },
  { month: 'Sep', income: 7650, expenses: 3340, savings: 4310 }
];

export const TOP_MERCHANTS: MerchantSpending[] = [
  { merchant: 'Skyline Properties', totalSpent: 1950.00, transactionCount: 1, category: 'Housing', logoInitial: 'S', color: '#06b6d4' },
  { merchant: 'Delta Air Lines', totalSpent: 480.00, transactionCount: 1, category: 'Travel', logoInitial: 'D', color: '#3b82f6' },
  { merchant: 'Nordstrom', totalSpent: 245.00, transactionCount: 1, category: 'Shopping', logoInitial: 'N', color: '#ec4899' },
  { merchant: 'Equinox', totalSpent: 210.00, transactionCount: 1, category: 'Health & Fitness', logoInitial: 'E', color: '#10b981' },
  { merchant: 'Whole Foods Market', totalSpent: 164.20, transactionCount: 1, category: 'Groceries', logoInitial: 'W', color: '#10b981' },
  { merchant: 'Sushi Omakase', totalSpent: 142.50, transactionCount: 1, category: 'Food & Dining', logoInitial: 'O', color: '#f59e0b' }
];

export const SUBSCRIPTION_ITEMS: SubscriptionItem[] = [
  { id: 'sub-1', name: 'Netflix Premium 4K', cost: 22.99, billingCycle: 'monthly', nextBillingDate: '2026-09-18', category: 'Subscriptions', icon: 'Film' },
  { id: 'sub-2', name: 'Spotify Family', cost: 19.99, billingCycle: 'monthly', nextBillingDate: '2026-09-16', category: 'Subscriptions', icon: 'Music' },
  { id: 'sub-3', name: 'Apple One Premier', cost: 32.99, billingCycle: 'monthly', nextBillingDate: '2026-09-29', category: 'Subscriptions', icon: 'Cloud' },
  { id: 'sub-4', name: 'GitHub Copilot Enterprise', cost: 19.00, billingCycle: 'monthly', nextBillingDate: '2026-09-08', category: 'Subscriptions', icon: 'Terminal' },
  { id: 'sub-5', name: 'Equinox All-Access', cost: 210.00, billingCycle: 'monthly', nextBillingDate: '2026-09-24', category: 'Health & Fitness', icon: 'Dumbbell' }
];

export const INITIAL_ASSISTANT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: "Hello Alex! I'm FinSight AI, your personal financial advisor. I've analyzed your cash flow for September 2026. Your savings rate is currently sitting at a strong 56.3%, but you've slightly exceeded your Shopping budget by $25. How can I assist with your finances today?",
    timestamp: '10:00 AM',
    suggestions: [
      'How can I save $400 more this month?',
      'Break down my recurring subscriptions',
      'What is my projected year-end savings?',
      'Show me dining out expense trends'
    ],
    metricsPreview: [
      { label: 'Current Net Savings', value: '$4,310', trend: '+14% MoM' },
      { label: 'Top Outflow', value: 'Housing ($1,950)' },
      { label: 'Budget Utilization', value: '68.4%' }
    ]
  }
];

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenseTx = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  
  const map = new Map<string, { amount: number; count: number }>();
  expenseTx.forEach(t => {
    const curr = map.get(t.category) || { amount: 0, count: 0 };
    map.set(t.category, {
      amount: curr.amount + t.amount,
      count: curr.count + 1
    });
  });

  const categoryColors: Record<string, string> = {
    'Housing': '#06b6d4',
    'Food & Dining': '#f59e0b',
    'Groceries': '#10b981',
    'Transportation': '#3b82f6',
    'Shopping': '#f43f5e',
    'Subscriptions': '#8b5cf6',
    'Health & Fitness': '#14b8a6',
    'Utilities': '#eab308',
    'Travel': '#ec4899',
    'Miscellaneous': '#64748b'
  };

  const results: CategoryBreakdown[] = [];
  map.forEach((val, cat) => {
    results.push({
      category: cat as any,
      amount: Math.round(val.amount * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0,
      color: categoryColors[cat] || '#8b5cf6',
      count: val.count
    });
  });

  return results.sort((a, b) => b.amount - a.amount);
}
