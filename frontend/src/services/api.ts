import { supabase } from "../lib/supabase";

const API_BASE_URL = "http://127.0.0.1:8000";

export interface TransactionItem {
  id: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  account?: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
  color: string;
  bg_color: string;
}

export interface GoalItem {
  id: string;
  name: string;
  target: number;
  saved: number;
  icon: string;
  color: string;
  bg_color: string;
  deadline: string;
}

export interface LoanItem {
  id: string;
  loan_direction: "given" | "got";
  person: string;
  amount: number;
  type: string;
  date: string;
  next_settlement: string;
  return_date: string;
  interest_rate: number;
  notes: string;
  settled: boolean;
  settled_amount: number;
}

export interface AnalyticsOverview {
  monthly_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate: number;
  biggest_spend_category: string;
  biggest_spend_amount: number;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
    icon: string;
  }>;
  monthly_trends: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

export interface DashboardData {
  month_display: string;
  stats: Array<{
    title: string;
    value: string;
    icon: string;
    color: string;
    change: string;
  }>;
  recent_transactions: TransactionItem[];
  budget_status: BudgetItem[];
}

export interface AssistantReply {
  role: "assistant";
  text: string;
  timestamp: string;
  suggestions?: string[];
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Retrieve current active session token from Supabase
  let token: string | undefined;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token;
  } catch {
    // If Supabase session fetch fails, proceed without token
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

export const api = {
  // ── Dashboard ──────────────────────────────────────────────
  async getDashboard(month?: string): Promise<DashboardData> {
    const query = month ? `?month=${encodeURIComponent(month)}` : "";
    return request<DashboardData>(`/dashboard/${query}`);
  },

  // ── Transactions ──────────────────────────────────────────
  async getTransactions(filters?: { type?: string; month?: string; date?: string }): Promise<TransactionItem[]> {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== "all") params.append("type", filters.type);
    if (filters?.month) params.append("month", filters.month);
    if (filters?.date) params.append("date", filters.date);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const data = await request<any[]>(`/transactions/${qs}`);
    return data.map((t) => ({
      id: String(t.id),
      description: t.description || "Untitled",
      category: t.category || "Other",
      type: t.type,
      amount: Number(t.amount),
      date: t.transaction_date || t.date,
      account: t.account,
    }));
  },

  async addTransaction(tx: {
    description: string;
    category: string;
    type: "income" | "expense";
    amount: number;
    transaction_date: string;
    account?: string;
  }): Promise<TransactionItem> {
    const res = await request<any>("/transactions/", {
      method: "POST",
      body: JSON.stringify(tx),
    });
    return {
      id: String(res.id),
      description: res.description,
      category: res.category,
      type: res.type,
      amount: Number(res.amount),
      date: res.transaction_date || res.date,
      account: res.account,
    };
  },

  async deleteTransaction(id: string): Promise<void> {
    await request(`/transactions/${id}`, { method: "DELETE" });
  },

  // ── Budgets ───────────────────────────────────────────────
  async getBudgets(month?: string): Promise<BudgetItem[]> {
    const query = month ? `?month=${encodeURIComponent(month)}` : "";
    return request<BudgetItem[]>(`/budgets/${query}`);
  },

  async addBudget(budget: {
    category: string;
    limit_amount: number;
    icon?: string;
    color?: string;
    bg_color?: string;
  }): Promise<BudgetItem> {
    return request<BudgetItem>("/budgets/", {
      method: "POST",
      body: JSON.stringify(budget),
    });
  },

  async updateBudget(
    id: string,
    data: { category?: string; limit_amount?: number; icon?: string; color?: string; bg_color?: string }
  ): Promise<BudgetItem> {
    return request<BudgetItem>(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteBudget(id: string): Promise<void> {
    await request(`/budgets/${id}`, { method: "DELETE" });
  },

  // ── Goals ──────────────────────────────────────────────────
  async getGoals(): Promise<GoalItem[]> {
    return request<GoalItem[]>("/goals/");
  },

  async addGoal(goal: {
    name: string;
    target: number;
    icon?: string;
    color?: string;
    bg_color?: string;
    deadline?: string;
  }): Promise<GoalItem> {
    return request<GoalItem>("/goals/", {
      method: "POST",
      body: JSON.stringify(goal),
    });
  },

  async contributeToGoal(id: string, amount: number): Promise<GoalItem> {
    return request<GoalItem>(`/goals/${id}/contribute`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  async deleteGoal(id: string): Promise<void> {
    await request(`/goals/${id}`, { method: "DELETE" });
  },

  // ── Loans ──────────────────────────────────────────────────
  async getLoans(direction?: "given" | "got"): Promise<LoanItem[]> {
    const query = direction ? `?direction=${direction}` : "";
    return request<LoanItem[]>(`/loans/${query}`);
  },

  async addLoan(loan: {
    loan_direction: "given" | "got";
    person: string;
    amount: number;
    type?: string;
    date: string;
    next_settlement?: string;
    return_date?: string;
    interest_rate?: number;
    notes?: string;
  }): Promise<LoanItem> {
    return request<LoanItem>("/loans/", {
      method: "POST",
      body: JSON.stringify(loan),
    });
  },

  async settleLoan(id: string, amount: number): Promise<LoanItem> {
    return request<LoanItem>(`/loans/${id}/settle`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  async resetLoanSettlement(id: string): Promise<LoanItem> {
    return request<LoanItem>(`/loans/${id}/reset-settlement`, {
      method: "POST",
    });
  },

  async deleteLoan(id: string): Promise<void> {
    await request(`/loans/${id}`, { method: "DELETE" });
  },

  // ── Analytics ──────────────────────────────────────────────
  async getAnalytics(month?: string): Promise<AnalyticsOverview> {
    const query = month ? `?month=${encodeURIComponent(month)}` : "";
    return request<AnalyticsOverview>(`/analytics/overview${query}`);
  },

  // ── Assistant ──────────────────────────────────────────────
  async sendChatMessage(message: string): Promise<AssistantReply> {
    return request<AssistantReply>("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
};
