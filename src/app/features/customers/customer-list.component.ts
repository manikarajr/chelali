import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { CustomerFormComponent } from './customer-form.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [NgClass, SlidePanelComponent, CustomerFormComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent {
  private customerService = inject(CustomerService);

  customers = this.customerService.customers;
  isPanelOpen = signal(false);
  editingCustomer = signal<Customer | null>(null);
  isConfirmOpen = signal(false);
  pendingDeleteId = signal<number | null>(null);
  isConfirmSaveOpen = signal(false);
  pendingSaveData = signal<(Omit<Customer, 'id'> & { id?: number }) | null>(null);

  columns: TableColumn[] = [
    { key: 'index', label: '#', type: 'index' },
    { key: 'name', label: 'Name', className: 'font-medium text-gray-900' },
    { key: 'phone', label: 'Phone', className: 'text-gray-600' },
    { key: 'address', label: 'Address', className: 'text-gray-500 max-w-xs truncate', hiddenMd: true },
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

  onFormSaved(data: Omit<Customer, 'id'> & { id?: number }): void {
    this.pendingSaveData.set(data);
    this.isConfirmSaveOpen.set(true);
  }

  confirmSave(): void {
    const data = this.pendingSaveData();
    if (data) {
      if (data.id !== undefined) {
        this.customerService.update(data as Customer);
      } else {
        const { id: _id, ...rest } = data;
        this.customerService.add(rest);
      }
    }
    this.isConfirmSaveOpen.set(false);
    this.pendingSaveData.set(null);
    this.closePanel();
  }

  cancelSave(): void {
    this.isConfirmSaveOpen.set(false);
    this.pendingSaveData.set(null);
  }

  delete(id: number): void {
    this.pendingDeleteId.set(id);
    this.isConfirmOpen.set(true);
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    if (id !== null) this.customerService.delete(id);
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.isConfirmOpen.set(false);
    this.pendingDeleteId.set(null);
  }
}
