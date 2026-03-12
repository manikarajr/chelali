import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Expense, ExpenseCategory } from '../../core/models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
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
