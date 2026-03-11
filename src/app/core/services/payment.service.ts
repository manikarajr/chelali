import { Injectable, signal } from '@angular/core';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private _payments = signal<Payment[]>([
    { id: 1, customerId: 1, date: '2024-01-06', amount: 1000, method: 'cash', notes: 'Full payment for January batch' },
    { id: 2, customerId: 2, date: '2024-01-10', amount: 300, method: 'bank', notes: 'Partial payment' },
    { id: 3, customerId: 4, date: '2024-01-16', amount: 880, method: 'online', notes: 'UPI transfer' },
    { id: 4, customerId: 5, date: '2024-01-20', amount: 500, method: 'cash', notes: 'Advance payment' },
  ]);

  private nextId = 5;

  payments = this._payments.asReadonly();

  getAll(): Payment[] {
    return this._payments();
  }

  getByCustomer(customerId: number): Payment[] {
    return this._payments().filter(p => p.customerId === customerId);
  }

  add(payment: Omit<Payment, 'id'>): void {
    this._payments.update(list => [...list, { ...payment, id: this.nextId++ }]);
  }

  update(updated: Payment): void {
    this._payments.update(list => list.map(p => p.id === updated.id ? updated : p));
  }

  delete(id: number): void {
    this._payments.update(list => list.filter(p => p.id !== id));
  }
}
