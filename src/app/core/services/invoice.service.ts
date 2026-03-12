import { Injectable, signal, inject } from '@angular/core';
import { Invoice } from '../models/invoice.model';
import { TransactionService } from './transaction.service';
import { CustomerService } from './customer.service';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private transactionService = inject(TransactionService);
  private customerService = inject(CustomerService);

  private _invoices = signal<Invoice[]>([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      customerId: 1,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      generatedDate: '2024-02-01',
      previousOutstanding: 0,
      currentPurchases: 2600,
      paymentsReceived: 1000,
      totalOutstanding: 1600,
    },
  ]);

  private nextId = 2;
  private nextInvNum = 2;

  invoices = this._invoices.asReadonly();

  getAll(): Invoice[] {
    return this._invoices();
  }

  getById(id: number): Invoice | undefined {
    return this._invoices().find((i) => i.id === id);
  }

  getByCustomer(customerId: number): Invoice[] {
    return this._invoices().filter((i) => i.customerId === customerId);
  }

  calculateInvoiceData(customerId: number, startDate: string, endDate: string) {
    const allTransactions = this.transactionService.getByCustomer(customerId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter transactions within period
    const periodTransactions = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    // Previous outstanding: Total purchases - Total payments before startDate
    const previousTransactions = allTransactions.filter((t) => new Date(t.date) < start);
    const prevPurchases = previousTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const prevPayments = previousTransactions.reduce((acc, t) => acc + t.paidAmount, 0);
    const previousOutstanding = prevPurchases - prevPayments;

    const currentPurchases = periodTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const paymentsReceived = periodTransactions.reduce((acc, t) => acc + t.paidAmount, 0);
    const totalOutstanding = previousOutstanding + currentPurchases - paymentsReceived;

    return {
      previousOutstanding,
      currentPurchases,
      paymentsReceived,
      totalOutstanding,
      transactions: periodTransactions,
    };
  }

  add(invoiceData: { customerId: number; startDate: string; endDate: string }): void {
    const breakdown = this.calculateInvoiceData(
      invoiceData.customerId,
      invoiceData.startDate,
      invoiceData.endDate
    );

    const num = String(this.nextInvNum++).padStart(3, '0');
    const invoiceNumber = `INV-2026-${num}`;
    const generatedDate = new Date().toISOString().split('T')[0];

    const newInvoice: Invoice = {
      id: this.nextId++,
      invoiceNumber,
      customerId: invoiceData.customerId,
      startDate: invoiceData.startDate,
      endDate: invoiceData.endDate,
      generatedDate,
      ...breakdown,
    };

    this._invoices.update((list) => [...list, newInvoice]);

    // Update customer's last invoice date
    this.customerService.updateLastInvoiceDate(invoiceData.customerId, invoiceData.endDate);
  }

  delete(id: number): void {
    this._invoices.update((list) => list.filter((i) => i.id !== id));
  }
}
