import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense } from '../../core/models/expense.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { ExpenseFormComponent } from './expense-form.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmployeeExpenseTabComponent } from './employee-expense-tab.component';

const CATEGORY_COLORS: Record<string, string> = {
  electricity: 'bg-yellow-100 text-yellow-800',
  labour: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-purple-100 text-purple-800',
  transport: 'bg-orange-100 text-orange-800',
};

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, TitleCasePipe, SlidePanelComponent, ExpenseFormComponent, DataTableComponent, ConfirmDialogComponent, EmployeeExpenseTabComponent],
  templateUrl: './expense-list.component.html',
})
export class ExpenseListComponent {
  private expenseService = inject(ExpenseService);

  activeTab = signal<'expenses' | 'employee-expenses'>('expenses');

  expenses = this.expenseService.expenses;
  isPanelOpen = signal(false);
  editingExpense = signal<Expense | null>(null);
  deleteTargetId = signal<number | null>(null);
  isConfirmSaveOpen = signal(false);
  pendingSaveData = signal<(Omit<Expense, 'id'> & { id?: number }) | null>(null);

  columns: TableColumn[] = [
    { key: 'category', label: 'Category', type: 'status' },
    { key: 'date', label: 'Date', type: 'date', className: 'text-gray-500', hiddenSm: true },
    { key: 'amount', label: 'Amount', type: 'currency', className: 'text-right font-semibold text-gray-900' },
    { key: 'notes', label: 'Notes', className: 'text-gray-500 max-w-xs truncate', hiddenMd: true },
    { key: 'actions', label: 'Actions', type: 'actions', className: 'text-center' }
  ];

  categorySummary = computed(() => {
    const cats = ['electricity', 'labour', 'maintenance', 'transport'];
    return cats.map(cat => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      total: this.expenses().filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    }));
  });

  categoryColor(category: string): string {
    return CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700';
  }

  openAdd(): void {
    this.editingExpense.set(null);
    this.isPanelOpen.set(true);
  }

  openEdit(e: Expense): void {
    this.editingExpense.set(e);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.editingExpense.set(null);
  }

  onFormSaved(data: Omit<Expense, 'id'> & { id?: number }): void {
    this.pendingSaveData.set(data);
    this.isConfirmSaveOpen.set(true);
  }

  confirmSave(): void {
    const data = this.pendingSaveData();
    if (data) {
      if (data.id !== undefined) {
        this.expenseService.update(data as Expense);
      } else {
        const { id: _id, ...rest } = data;
        this.expenseService.add(rest);
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
    if (id !== null) this.expenseService.delete(id);
    this.deleteTargetId.set(null);
  }

  cancelDelete(): void {
    this.deleteTargetId.set(null);
  }
}
