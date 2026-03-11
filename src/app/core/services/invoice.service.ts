import { Injectable, signal } from '@angular/core';
import { Invoice } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private _invoices = signal<Invoice[]>([
    { id: 1, invoiceNumber: 'INV-2024-001', customerId: 1, startDate: '2024-01-01', endDate: '2024-01-31', totalAmount: 2600, outstandingAmount: 1600 },
    { id: 2, invoiceNumber: 'INV-2024-002', customerId: 2, startDate: '2024-01-01', endDate: '2024-01-31', totalAmount: 600, outstandingAmount: 300 },
    { id: 3, invoiceNumber: 'INV-2024-003', customerId: 4, startDate: '2024-01-01', endDate: '2024-01-31', totalAmount: 880, outstandingAmount: 0 },
    { id: 4, invoiceNumber: 'INV-2024-004', customerId: 5, startDate: '2024-01-01', endDate: '2024-01-31', totalAmount: 1200, outstandingAmount: 700 },
  ]);

  private nextId = 5;
  private nextInvNum = 5;

  invoices = this._invoices.asReadonly();

  getAll(): Invoice[] {
    return this._invoices();
  }

  getById(id: number): Invoice | undefined {
    return this._invoices().find(i => i.id === id);
  }

  getByCustomer(customerId: number): Invoice[] {
    return this._invoices().filter(i => i.customerId === customerId);
  }

  add(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): void {
    const num = String(this.nextInvNum++).padStart(3, '0');
    const invoiceNumber = `INV-2024-${num}`;
    this._invoices.update(list => [...list, { ...invoice, id: this.nextId++, invoiceNumber }]);
  }

  delete(id: number): void {
    this._invoices.update(list => list.filter(i => i.id !== id));
  }
}
