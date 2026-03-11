import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Expense, ExpenseCategory } from '../../core/models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select
          formControlName="category"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 bg-white"
        >
          @for (cat of categories; track cat.value) {
            <option [value]="cat.value">{{ cat.label }}</option>
          }
        </select>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
        <input
          type="number"
          formControlName="amount"
          placeholder="0"
          min="1"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
        />
        @if (form.get('amount')?.invalid && form.get('amount')?.touched) {
          <p class="text-xs text-red-500 mt-1">Amount must be greater than 0.</p>
        }
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input
          type="date"
          formControlName="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          formControlName="notes"
          rows="3"
          placeholder="Optional notes…"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          [disabled]="form.invalid"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium
                 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {{ expense() ? 'Update Expense' : 'Add Expense' }}
        </button>
        <button
          type="button"
          (click)="cancelled.emit()"
          class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium
                 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  `,
})
export class ExpenseFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  expense = input<Expense | null>(null);
  saved = output<Omit<Expense, 'id'> & { id?: number }>();
  cancelled = output<void>();

  categories = [
    { value: 'electricity', label: 'Electricity' },
    { value: 'labour', label: 'Labour' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'transport', label: 'Transport' },
  ];

  form = this.fb.group({
    category: ['electricity' as ExpenseCategory, Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    notes: [''],
  });

  ngOnChanges(): void {
    const e = this.expense();
    if (e) {
      this.form.patchValue({
        category: e.category,
        amount: e.amount,
        date: e.date,
        notes: e.notes,
      });
    } else {
      this.form.reset({
        category: 'electricity',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const e = this.expense();
    this.saved.emit({
      ...(e ? { id: e.id } : {}),
      category: (val.category as ExpenseCategory) ?? 'electricity',
      amount: val.amount ?? 0,
      date: val.date ?? '',
      notes: val.notes ?? '',
    });
    this.form.reset({
      category: 'electricity',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  }
}
