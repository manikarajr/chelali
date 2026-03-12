import { Injectable, signal } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions = signal<Transaction[]>([
    { id: 1, customerId: 1, date: '2024-01-05', quantity: 50, unitPrice: 20, totalAmount: 1000, paidAmount: 1000, outstandingAmount: 0, paymentStatus: 'paid', paymentMethod: 'cash' },
    { id: 2, customerId: 2, date: '2024-01-08', quantity: 30, unitPrice: 20, totalAmount: 600, paidAmount: 300, outstandingAmount: 300, paymentStatus: 'partial', paymentMethod: 'bank' },
    { id: 3, customerId: 1, date: '2024-01-12', quantity: 80, unitPrice: 20, totalAmount: 1600, paidAmount: 0, outstandingAmount: 1600, paymentStatus: 'unpaid', paymentMethod: 'cash' },
    { id: 4, customerId: 4, date: '2024-01-15', quantity: 40, unitPrice: 22, totalAmount: 880, paidAmount: 880, outstandingAmount: 0, paymentStatus: 'paid', paymentMethod: 'online' },
    { id: 5, customerId: 5, date: '2024-01-18', quantity: 60, unitPrice: 20, totalAmount: 1200, paidAmount: 500, outstandingAmount: 700, paymentStatus: 'partial', paymentMethod: 'cash' },
  ]);

  private nextId = 6;

  transactions = this._transactions.asReadonly();

  getAll(): Transaction[] {
    return this._transactions();
  }

  getByCustomer(customerId: number): Transaction[] {
    return this._transactions().filter(t => t.customerId === customerId);
  }

  add(transaction: Omit<Transaction, 'id'>): void {
    this._transactions.update(list => [...list, { ...transaction, id: this.nextId++ }]);
  }

  update(updated: Transaction): void {
    this._transactions.update(list => list.map(t => t.id === updated.id ? updated : t));
  }

  delete(id: number): void {
    this._transactions.update(list => list.filter(t => t.id !== id));
  }
}
