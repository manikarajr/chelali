import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { CustomerService } from '../../core/services/customer.service';
import { Transaction } from '../../core/models/transaction.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { TransactionFormComponent } from './transaction-form.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, TitleCasePipe, SlidePanelComponent, TransactionFormComponent, DataTableComponent],
  templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent {
  private txService = inject(TransactionService);
  private customerService = inject(CustomerService);

  transactions = this.txService.transactions;
  customers = this.customerService.customers;
  isPanelOpen = signal(false);
  editingTransaction = signal<Transaction | null>(null);

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

  onSaved(data: Omit<Transaction, 'id'> & { id?: number }): void {
    if (data.id !== undefined) {
      this.txService.update(data as Transaction);
    } else {
      const { id: _id, ...rest } = data;
      this.txService.add(rest);
    }
    this.closePanel();
  }

  delete(id: number): void {
    if (confirm('Delete this transaction?')) {
      this.txService.delete(id);
    }
  }
}
