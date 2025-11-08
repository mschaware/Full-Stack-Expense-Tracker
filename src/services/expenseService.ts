import { supabase } from '../lib/supabase';

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  category: string;
  amount: number;
  comments?: string;
}

export interface UpdateExpenseData {
  category?: string;
  amount?: number;
  comments?: string;
}

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(expenseData: CreateExpenseData): Promise<Expense> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category: expenseData.category,
        amount: expenseData.amount,
        comments: expenseData.comments || '',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, expenseData: UpdateExpenseData): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCategorySummary(): Promise<{ category: string; total: number }[]> {
    const expenses = await this.getAll();

    const summary = expenses.reduce((acc, expense) => {
      const existing = acc.find(item => item.category === expense.category);
      if (existing) {
        existing.total += Number(expense.amount);
      } else {
        acc.push({
          category: expense.category,
          total: Number(expense.amount),
        });
      }
      return acc;
    }, [] as { category: string; total: number }[]);

    return summary.sort((a, b) => b.total - a.total);
  },
};
