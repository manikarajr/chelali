import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { CustomerService } from '../../core/services/customer.service';
import { Transaction, PaymentStatus } from '../../core/models/transaction.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { TransactionFormComponent } from './transaction-form.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, TitleCasePipe, FormsModule, SlidePanelComponent, TransactionFormComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent {
  private txService = inject(TransactionService);
  private customerService = inject(CustomerService);

  transactions = this.txService.transactions;
  customers = this.customerService.customers;
  isPanelOpen = signal(false);
  editingTransaction = signal<Transaction | null>(null);
  deleteTargetId = signal<number | null>(null);
  isConfirmSaveOpen = signal(false);
  pendingSaveData = signal<(Omit<Transaction, 'id'> & { id?: number }) | null>(null);

  // Filter state
  filterCustomerId = signal<number | null>(null);
  filterStatus = signal<PaymentStatus | null>(null);
  filterOutstanding = signal<'has' | 'none' | null>(null);
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');

  filteredTransactions = computed(() => {
    let data = this.transactions();
    const cId = this.filterCustomerId();
    const status = this.filterStatus();
    const outstanding = this.filterOutstanding();
    const from = this.filterDateFrom();
    const to = this.filterDateTo();

    if (cId !== null) data = data.filter(t => t.customerId === cId);
    if (status) data = data.filter(t => t.paymentStatus === status);
    if (outstanding === 'has') data = data.filter(t => t.outstandingAmount > 0);
    if (outstanding === 'none') data = data.filter(t => t.outstandingAmount === 0);
    if (from) data = data.filter(t => t.date >= from);
    if (to) data = data.filter(t => t.date <= to);
    return data;
  });

  hasActiveFilters = computed(() =>
    this.filterCustomerId() !== null ||
    this.filterStatus() !== null ||
    this.filterOutstanding() !== null ||
    !!this.filterDateFrom() ||
    !!this.filterDateTo()
  );

  clearFilters(): void {
    this.filterCustomerId.set(null);
    this.filterStatus.set(null);
    this.filterOutstanding.set(null);
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
  }

  columns: TableColumn[] = [
    { key: 'customerId', label: 'Customer', className: 'font-medium text-gray-900' },
    { key: 'date', label: 'Date', type: 'date', className: 'text-gray-500', hiddenSm: true },
    { key: 'quantity', label: 'Qty (kg)', type: 'number', className: 'text-right text-gray-700', hiddenMd: true },
    { key: 'unitPrice', label: 'Unit Price', type: 'currency', className: 'text-right text-gray-700', hiddenMd: true },
    { key: 'totalAmount', label: 'Total', type: 'currency', className: 'text-right font-medium text-gray-900' },
    { key: 'paidAmount', label: 'Paid', type: 'currency', className: 'text-right text-green-600', hiddenSm: true },
    { key: 'outstandingAmount', label: 'Outstanding', type: 'currency', className: 'text-right font-semibold' },
    { key: 'paymentStatus', label: 'Status', type: 'status', className: 'text-center' },
    { key: 'actions', label: 'Actions', type: 'actions', className: 'text-center' }
  ];

  customerName(id: number): string {
    return this.customerService.getById(id)?.name ?? 'Unknown';
  }

  openAdd(): void {
    this.editingTransaction.set(null);
    this.isPanelOpen.set(true);
  }

  openEdit(t: Transaction): void {
    this.editingTransaction.set(t);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.editingTransaction.set(null);
  }

  onFormSaved(data: Omit<Transaction, 'id'> & { id?: number }): void {
    this.pendingSaveData.set(data);
    this.isConfirmSaveOpen.set(true);
  }

  confirmSave(): void {
    const data = this.pendingSaveData();
    if (data) {
      if (data.id !== undefined) {
        this.txService.update(data as Transaction);
      } else {
        const { id: _id, ...rest } = data;
        this.txService.add(rest);
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
    this.deleteTargetId.set(id);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id !== null) this.txService.delete(id);
    this.deleteTargetId.set(null);
  }

  cancelDelete(): void {
    this.deleteTargetId.set(null);
  }
}
