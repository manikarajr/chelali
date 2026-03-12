import { Injectable, signal } from '@angular/core';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private _expenses = signal<Expense[]>([
    // March 2026 (current month)
    { id: 1,  category: 'electricity',  amount: 8500,  date: '2026-03-01', notes: 'March electricity bill' },
    { id: 2,  category: 'labour',       amount: 14000, date: '2026-03-01', notes: 'Worker wages — March' },
    { id: 3,  category: 'maintenance',  amount: 2800,  date: '2026-03-05', notes: 'Ice machine servicing' },
    { id: 4,  category: 'transport',    amount: 3600,  date: '2026-03-07', notes: 'Delivery vehicle fuel' },
    { id: 5,  category: 'maintenance',  amount: 1500,  date: '2026-03-10', notes: 'Compressor repair' },
    { id: 6,  category: 'transport',    amount: 2200,  date: '2026-03-12', notes: 'Extra delivery run' },
    // February 2026
    { id: 7,  category: 'electricity',  amount: 9100,  date: '2026-02-01', notes: 'February electricity bill' },
    { id: 8,  category: 'labour',       amount: 13500, date: '2026-02-01', notes: 'Worker wages — February' },
    { id: 9,  category: 'maintenance',  amount: 4200,  date: '2026-02-14', notes: 'Annual plant maintenance' },
    { id: 10, category: 'transport',    amount: 3100,  date: '2026-02-20', notes: 'Fuel & tolls' },
  ]);

  private nextId = 11;

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
