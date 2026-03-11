import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { Transaction } from '../../core/models/transaction.model';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-transaction-form',
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

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
        <input
          type="date"
          formControlName="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Quantity & Unit Price -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity (kg) *</label>
          <input
            type="number"
            formControlName="quantity"
            placeholder="0"
            min="1"
            (input)="recalculate()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                   focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹) *</label>
          <input
            type="number"
            formControlName="unitPrice"
            placeholder="0"
            min="0"
            (input)="recalculate()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                   focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Total Amount (readonly) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
        <input
          type="number"
          formControlName="totalAmount"
          readonly
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
        />
      </div>

      <!-- Paid Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Paid Amount (₹)</label>
        <input
          type="number"
          formControlName="paidAmount"
          placeholder="0"
          min="0"
          (input)="recalculate()"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Outstanding Amount (readonly) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Outstanding Amount (₹)</label>
        <input
          type="number"
          formControlName="outstandingAmount"
          readonly
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
        />
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
          {{ transaction() ? 'Update' : 'Add Transaction' }}
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
export class TransactionFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  transaction = input<Transaction | null>(null);
  customers = input<Customer[]>([]);
  saved = output<Omit<Transaction, 'id'> & { id?: number }>();
  cancelled = output<void>();

  form = this.fb.group({
    customerId: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    unitPrice: [20, [Validators.required, Validators.min(0)]],
    totalAmount: [{ value: 0, disabled: true }],
    paidAmount: [0, [Validators.min(0)]],
    outstandingAmount: [{ value: 0, disabled: true }],
  });

  ngOnChanges(): void {
    const t = this.transaction();
    if (t) {
      this.form.patchValue({
        customerId: String(t.customerId),
        date: t.date,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        totalAmount: t.totalAmount,
        paidAmount: t.paidAmount,
        outstandingAmount: t.outstandingAmount,
      });
    } else {
      this.form.reset({
        date: new Date().toISOString().split('T')[0],
        quantity: 0,
        unitPrice: 20,
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
      });
    }
  }

  recalculate(): void {
    const qty = this.form.get('quantity')?.value ?? 0;
    const price = this.form.get('unitPrice')?.value ?? 0;
    const paid = this.form.get('paidAmount')?.value ?? 0;
    const total = qty * price;
    const outstanding = Math.max(0, total - paid);
    this.form.patchValue({ totalAmount: total, outstandingAmount: outstanding }, { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const total = (val.quantity ?? 0) * (val.unitPrice ?? 0);
    const paid = val.paidAmount ?? 0;
    const outstanding = Math.max(0, total - paid);
    let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (outstanding === 0) status = 'paid';
    else if (paid > 0) status = 'partial';

    const t = this.transaction();
    this.saved.emit({
      ...(t ? { id: t.id } : {}),
      customerId: Number(val.customerId),
      date: val.date ?? '',
      quantity: val.quantity ?? 0,
      unitPrice: val.unitPrice ?? 0,
      totalAmount: total,
      paidAmount: paid,
      outstandingAmount: outstanding,
      paymentStatus: status,
    });
    this.form.reset({
      date: new Date().toISOString().split('T')[0],
      quantity: 0,
      unitPrice: 20,
      totalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
    });
  }
}
