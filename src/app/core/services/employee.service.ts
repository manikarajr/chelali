import { Injectable, signal } from '@angular/core';
import { Employee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private _employees = signal<Employee[]>([
    { id: 1, name: 'Ravi Kumar',  phone: '9876543210', basicSalary: 15000, status: 'active' },
    { id: 2, name: 'Suresh Babu', phone: '9123456789', basicSalary: 12000, status: 'active' },
    { id: 3, name: 'Mohan Das',                        basicSalary: 10000, status: 'active' },
  ]);

  private nextId = 4;

  employees = this._employees.asReadonly();

  getAll(): Employee[] { return this._employees(); }

  getById(id: number): Employee | undefined {
    return this._employees().find(e => e.id === id);
  }

  add(employee: Omit<Employee, 'id'>): void {
    this._employees.update(list => [...list, { ...employee, id: this.nextId++ }]);
  }

  update(updated: Employee): void {
    this._employees.update(list => list.map(e => e.id === updated.id ? updated : e));
  }

  delete(id: number): void {
    this._employees.update(list => list.filter(e => e.id !== id));
  }
}
