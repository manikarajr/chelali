export type ExpenseCategory = 'electricity' | 'labour' | 'maintenance' | 'transport';

export interface Expense {
  id: number;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes: string;
}
