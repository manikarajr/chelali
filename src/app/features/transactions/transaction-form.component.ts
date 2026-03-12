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
  templateUrl: './transaction-form.component.html',
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
