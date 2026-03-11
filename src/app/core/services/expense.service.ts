import { Injectable, signal } from '@angular/core';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private _expenses = signal<Expense[]>([
    { id: 1, category: 'electricity', amount: 8500, date: '2024-01-01', notes: 'Monthly electricity bill' },
    { id: 2, category: 'labour', amount: 12000, date: '2024-01-05', notes: 'Worker wages for January' },
    { id: 3, category: 'maintenance', amount: 3200, date: '2024-01-10', notes: 'Ice machine servicing' },
    { id: 4, category: 'transport', amount: 4500, date: '2024-01-15', notes: 'Delivery vehicle fuel' },
    { id: 5, category: 'electricity', amount: 9100, date: '2024-02-01', notes: 'February electricity bill' },
  ]);

  private nextId = 6;

  expenses = this._expenses.asReadonly();

  getAll(): Expense[] {
    return this._expenses();
  }

  add(expense: Omit<Expense, 'id'>): void {
    this._expenses.update(list => [...list, { ...expense, id: this.nextId++ }]);
  }

  update(updated: Expense): void {
    this._expenses.update(list => list.map(e => e.id === updated.id ? updated : e));
  }

  delete(id: number): void {
    this._expenses.update(list => list.filter(e => e.id !== id));
  }
}
