import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { CustomerFormComponent } from './customer-form.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [NgClass, SlidePanelComponent, CustomerFormComponent, DataTableComponent],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent {
  private customerService = inject(CustomerService);

  customers = this.customerService.customers;
  isPanelOpen = signal(false);
  editingCustomer = signal<Customer | null>(null);

  columns: TableColumn[] = [
    { key: 'index', label: '#', type: 'index' },
    { key: 'name', label: 'Name', className: 'font-medium text-gray-900' },
    { key: 'phone', label: 'Phone', className: 'text-gray-600' },
    { key: 'address', label: 'Address', className: 'text-gray-500 max-w-xs truncate', hiddenMd: true },
    { key: 'openingBalance', label: 'Opening Balance', type: 'currency', className: 'text-right text-gray-700', hiddenSm: true },
    { key: 'status', label: 'Status', type: 'status', className: 'text-center' },
    { key: 'actions', label: 'Actions', type: 'actions', className: 'text-center' }
  ];

  openAdd(): void {
    this.editingCustomer.set(null);
    this.isPanelOpen.set(true);
  }

  openEdit(customer: Customer): void {
    this.editingCustomer.set(customer);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.editingCustomer.set(null);
  }

  onSaved(data: Omit<Customer, 'id'> & { id?: number }): void {
    if (data.id !== undefined) {
      this.customerService.update(data as Customer);
    } else {
      const { id: _id, ...rest } = data;
      this.customerService.add(rest);
    }
    this.closePanel();
  }

  delete(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.delete(id);
    }
  }
}
