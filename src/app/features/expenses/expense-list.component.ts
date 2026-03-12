import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense } from '../../core/models/expense.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { ExpenseFormComponent } from './expense-form.component';

const CATEGORY_COLORS: Record<string, string> = {
  electricity: 'bg-yellow-100 text-yellow-800',
  labour: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-purple-100 text-purple-800',
  transport: 'bg-orange-100 text-orange-800',
};

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, TitleCasePipe, SlidePanelComponent, ExpenseFormComponent],
  templateUrl: './expense-list.component.html',
})
export class ExpenseListComponent {
  private expenseService = inject(ExpenseService);

  expenses = this.expenseService.expenses;
  searchQuery = signal('');
  isPanelOpen = signal(false);
  editingExpense = signal<Expense | null>(null);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.expenses();
    return this.expenses().filter(e =>
      e.category.includes(q) || e.notes.toLowerCase().includes(q)
    );
  });

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

  onSaved(data: Omit<Expense, 'id'> & { id?: number }): void {
    if (data.id !== undefined) {
      this.expenseService.update(data as Expense);
    } else {
      const { id: _id, ...rest } = data;
      this.expenseService.add(rest);
    }
    this.closePanel();
  }

  delete(id: number): void {
    if (confirm('Delete this expense?')) {
      this.expenseService.delete(id);
    }
  }
}
