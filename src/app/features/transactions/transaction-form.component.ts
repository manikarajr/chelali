import { Component, DestroyRef, inject, input, OnChanges, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { Customer } from '../../core/models/customer.model';
import { PaymentMethod, PaymentStatus, Transaction } from '../../core/models/transaction.model';

const FORM_DEFAULTS = {
  customerId: '' as string | number,
  date: new Date().toISOString().split('T')[0],
  quantity: 0,
  unitPrice: 20,
  totalAmount: 0,
  paidAmount: 0,
  outstandingAmount: 0,
  paymentMethod: 'cash' as PaymentMethod,
};

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule],
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
          @for (c of customers(); track c.id) {
            <option [value]="c.id">{{ c.name }}</option>
          }
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Payment Method -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
        <div class="flex gap-3">
          @for (m of methods; track m.value) {
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                formControlName="paymentMethod"
                [value]="m.value"
                class="text-blue-600"
              />
              <span class="text-sm text-gray-700">{{ m.label }}</span>
            </label>
          }
        </div>
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
  private destroyRef = inject(DestroyRef);

  transaction = input<Transaction | null>(null);
  customers = input<Customer[]>([]);
  saved = output<Omit<Transaction, 'id'> & { id?: number }>();
  cancelled = output<void>();

  readonly methods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank' },
    { value: 'online', label: 'Online' },
  ];

  form = this.fb.group({
    customerId: [FORM_DEFAULTS.customerId, Validators.required],
    date: [FORM_DEFAULTS.date, Validators.required],
    quantity: [FORM_DEFAULTS.quantity, [Validators.required, Validators.min(1)]],
    unitPrice: [FORM_DEFAULTS.unitPrice, [Validators.required, Validators.min(0)]],
    totalAmount: [{ value: FORM_DEFAULTS.totalAmount, disabled: true }],
    paidAmount: [FORM_DEFAULTS.paidAmount, Validators.min(0)],
    outstandingAmount: [{ value: FORM_DEFAULTS.outstandingAmount, disabled: true }],
    paymentMethod: [FORM_DEFAULTS.paymentMethod, Validators.required],
  });

  constructor() {
    merge(
      this.form.get('quantity')!.valueChanges,
      this.form.get('unitPrice')!.valueChanges,
      this.form.get('paidAmount')!.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculate());
  }

  ngOnChanges(): void {
    const t = this.transaction();
    if (t) {
      this.form.patchValue({
        customerId: t.customerId,
        date: t.date,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        totalAmount: t.totalAmount,
        paidAmount: t.paidAmount,
        outstandingAmount: t.outstandingAmount,
        paymentMethod: t.paymentMethod,
      });
    } else {
      this.form.reset(FORM_DEFAULTS);
    }
  }

  private recalculate(): void {
    const qty = this.form.get('quantity')?.value ?? 0;
    const price = this.form.get('unitPrice')?.value ?? 0;
    const paid = this.form.get('paidAmount')?.value ?? 0;
    const total = qty * price;
    this.form.patchValue(
      { totalAmount: total, outstandingAmount: Math.max(0, total - paid) },
      { emitEvent: false },
    );
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const total = (val.quantity ?? 0) * (val.unitPrice ?? 0);
    const paid = val.paidAmount ?? 0;
    const outstanding = Math.max(0, total - paid);

    let paymentStatus: PaymentStatus = 'unpaid';
    if (outstanding === 0) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partial';

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
      paymentStatus,
      paymentMethod: val.paymentMethod ?? 'cash',
    });
    this.form.reset(FORM_DEFAULTS);
  }
}
