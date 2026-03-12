import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { CustomerService } from '../../core/services/customer.service';
import { Transaction } from '../../core/models/transaction.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { TransactionFormComponent } from './transaction-form.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, TitleCasePipe, SlidePanelComponent, TransactionFormComponent],
  templateUrl: './transaction-list.component.html',
})
export class TransactionListComponent {
  private txService = inject(TransactionService);
  private customerService = inject(CustomerService);

  transactions = this.txService.transactions;
  customers = this.customerService.customers;
  searchQuery = signal('');
  isPanelOpen = signal(false);
  editingTransaction = signal<Transaction | null>(null);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.transactions();
    return this.transactions().filter(t =>
      this.customerName(t.customerId).toLowerCase().includes(q)
    );
  });

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
