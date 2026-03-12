import { Injectable, signal } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private _transactions = signal<Transaction[]>([
    // March 2026 (current month)
    { id: 1,  customerId: 1, date: '2026-03-01', quantity: 50,  unitPrice: 20, totalAmount: 1000, paidAmount: 1000, outstandingAmount: 0,    paymentStatus: 'paid',    paymentMethod: 'cash' },
    { id: 2,  customerId: 2, date: '2026-03-02', quantity: 30,  unitPrice: 20, totalAmount: 600,  paidAmount: 300,  outstandingAmount: 300,  paymentStatus: 'partial', paymentMethod: 'bank' },
    { id: 3,  customerId: 3, date: '2026-03-03', quantity: 80,  unitPrice: 20, totalAmount: 1600, paidAmount: 0,    outstandingAmount: 1600, paymentStatus: 'unpaid',  paymentMethod: 'cash' },
    { id: 4,  customerId: 4, date: '2026-03-05', quantity: 40,  unitPrice: 22, totalAmount: 880,  paidAmount: 880,  outstandingAmount: 0,    paymentStatus: 'paid',    paymentMethod: 'online' },
    { id: 5,  customerId: 5, date: '2026-03-06', quantity: 60,  unitPrice: 20, totalAmount: 1200, paidAmount: 500,  outstandingAmount: 700,  paymentStatus: 'partial', paymentMethod: 'cash' },
    { id: 6,  customerId: 1, date: '2026-03-08', quantity: 100, unitPrice: 20, totalAmount: 2000, paidAmount: 2000, outstandingAmount: 0,    paymentStatus: 'paid',    paymentMethod: 'bank' },
    { id: 7,  customerId: 2, date: '2026-03-09', quantity: 45,  unitPrice: 22, totalAmount: 990,  paidAmount: 0,    outstandingAmount: 990,  paymentStatus: 'unpaid',  paymentMethod: 'cash' },
    { id: 8,  customerId: 4, date: '2026-03-10', quantity: 70,  unitPrice: 20, totalAmount: 1400, paidAmount: 1400, outstandingAmount: 0,    paymentStatus: 'paid',    paymentMethod: 'online' },
    { id: 9,  customerId: 5, date: '2026-03-11', quantity: 25,  unitPrice: 22, totalAmount: 550,  paidAmount: 300,  outstandingAmount: 250,  paymentStatus: 'partial', paymentMethod: 'bank' },
    { id: 10, customerId: 3, date: '2026-03-12', quantity: 90,  unitPrice: 20, totalAmount: 1800, paidAmount: 1800, outstandingAmount: 0,    paymentStatus: 'paid',    paymentMethod: 'cash' },
    // February 2026
    { id: 11, customerId: 1, date: '2026-02-05', quantity: 60,  unitPrice: 20, totalAmount: 1200, paidAmount: 1200, outstandingAmount: 0,    paymentStatus: 'paid',    paymentMethod: 'cash' },
    { id: 12, customerId: 2, date: '2026-02-10', quantity: 35,  unitPrice: 20, totalAmount: 700,  paidAmount: 350,  outstandingAmount: 350,  paymentStatus: 'partial', paymentMethod: 'bank' },
    { id: 13, customerId: 4, date: '2026-02-18', quantity: 55,  unitPrice: 22, totalAmount: 1210, paidAmount: 0,    outstandingAmount: 1210, paymentStatus: 'unpaid',  paymentMethod: 'cash' },
  ]);

  private nextId = 14;

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
