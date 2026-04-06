import { Injectable, signal, computed } from '@angular/core';
import { EmployeeExpense } from '../models/employee-expense.model';

@Injectable({ providedIn: 'root' })
export class EmployeeExpenseService {
  private _expenses = signal<EmployeeExpense[]>([
    { id: 1, employeeId: 1, paymentType: 'salary',    amount: 15000, date: '2026-03-01', notes: 'March salary' },
    { id: 2, employeeId: 2, paymentType: 'salary',    amount: 12000, date: '2026-03-01', notes: 'March salary' },
    { id: 3, employeeId: 1, paymentType: 'advance',   amount: 3000,  date: '2026-03-10', notes: 'Medical advance' },
    { id: 4, employeeId: 3, paymentType: 'allowance', amount: 1000,  date: '2026-03-15', notes: 'Festival allowance' },
    { id: 5, employeeId: 2, paymentType: 'advance',   amount: 2000,  date: '2026-02-15', notes: 'Personal advance' },
  ]);

  private nextId = 6;

  expenses = this._expenses.asReadonly();

  /** Total of all employee payments (for dashboard/report integration) */
  totalAmount = computed(() =>
    this._expenses().reduce((sum, e) => sum + e.amount, 0)
  );

  getAll(): EmployeeExpense[] { return this._expenses(); }

  /**
   * Returns the total advances taken by an employee in the given month.
   * Pass excludeId to skip a specific record (used when editing an advance).
   */
  getMonthlyAdvance(employeeId: number, year: number, month: number, excludeId?: number): number {
    return this._expenses()
      .filter(e => {
        if (e.employeeId !== employeeId || e.paymentType !== 'advance') return false;
        if (excludeId !== undefined && e.id === excludeId) return false;
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }

  add(expense: Omit<EmployeeExpense, 'id'>): void {
    this._expenses.update(list => [...list, { ...expense, id: this.nextId++ }]);
  }

  update(updated: EmployeeExpense): void {
    this._expenses.update(list => list.map(e => e.id === updated.id ? updated : e));
  }

  delete(id: number): void {
    this._expenses.update(list => list.filter(e => e.id !== id));
  }
}
