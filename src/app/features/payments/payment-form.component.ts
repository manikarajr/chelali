import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { Payment } from '../../core/models/payment.model';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <!-- Customer -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
        <select
          formControlName="customerId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select customer</option>
          <option *ngFor="let c of customers()" [value]="c.id">{{ c.name }}</option>
        </select>
        @if (form.get('customerId')?.invalid && form.get('customerId')?.touched) {
          <p class="text-xs text-red-500 mt-1">Customer is required.</p>
        }
      </div>

      <!-- Payment Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
        <input
          type="date"
          formControlName="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
        />
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

      <!-- Payment Method -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
        <div class="flex gap-3">
          @for (m of methods; track m.value) {
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                formControlName="method"
                [value]="m.value"
                class="text-blue-600"
              />
              <span class="text-sm text-gray-700">{{ m.label }}</span>
            </label>
          }
        </div>
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
          {{ payment() ? 'Update Payment' : 'Record Payment' }}
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
export class PaymentFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  payment = input<Payment | null>(null);
  customers = input<Customer[]>([]);
  saved = output<Omit<Payment, 'id'> & { id?: number }>();
  cancelled = output<void>();

  methods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank' },
    { value: 'online', label: 'Online' },
  ];

  form = this.fb.group({
    customerId: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    method: ['cash' as 'cash' | 'bank' | 'online', Validators.required],
    notes: [''],
  });

  ngOnChanges(): void {
    const p = this.payment();
    if (p) {
      this.form.patchValue({
        customerId: String(p.customerId),
        date: p.date,
        amount: p.amount,
        method: p.method,
        notes: p.notes,
      });
    } else {
      this.form.reset({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        method: 'cash',
        notes: '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const p = this.payment();
    this.saved.emit({
      ...(p ? { id: p.id } : {}),
      customerId: Number(val.customerId),
      date: val.date ?? '',
      amount: val.amount ?? 0,
      method: (val.method as 'cash' | 'bank' | 'online') ?? 'cash',
      notes: val.notes ?? '',
    });
    this.form.reset({ date: new Date().toISOString().split('T')[0], amount: 0, method: 'cash', notes: '' });
  }
}
