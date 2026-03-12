import { Injectable, signal } from '@angular/core';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private _customers = signal<Customer[]>([
    { id: 1, name: 'Ravi Kumar', phone: '9876543210', address: '12 MG Road, Bangalore', status: 'active' },
    { id: 2, name: 'Suresh Patel', phone: '9812345678', address: '45 Park Street, Mumbai', status: 'active' },
    { id: 3, name: 'Priya Singh', phone: '9898765432', address: '78 Lake View, Pune', status: 'inactive' },
    { id: 4, name: 'Ahmed Khan', phone: '9765432109', address: '23 Civil Lines, Delhi', status: 'active' },
    { id: 5, name: 'Meera Nair', phone: '9654321098', address: '56 Beach Road, Chennai', status: 'active' },
  ]);

  private nextId = 6;

  customers = this._customers.asReadonly();

  getAll(): Customer[] {
    return this._customers();
  }

  getById(id: number): Customer | undefined {
    return this._customers().find(c => c.id === id);
  }

  add(customer: Omit<Customer, 'id'>): void {
    this._customers.update(list => [...list, { ...customer, id: this.nextId++ }]);
  }

  update(updated: Customer): void {
    this._customers.update(list => list.map(c => c.id === updated.id ? updated : c));
  }

  updateLastInvoiceDate(id: number, date: string): void {
    this._customers.update(list => list.map(c => {
      if (c.id === id) {
        return { ...c, lastInvoiceDate: date };
      }
      return c;
    }));
  }

  delete(id: number): void {
    this._customers.update(list => list.filter(c => c.id !== id));
  }
}
