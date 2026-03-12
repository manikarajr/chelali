import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  customer = input<Customer | null>(null);
  saved = output<Omit<Customer, 'id'> & { id?: number }>();
  cancelled = output<void>();

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    address: [''],
    openingBalance: [0, [Validators.min(0)]],
    status: ['active' as 'active' | 'inactive'],
  });

  ngOnChanges(): void {
    const c = this.customer();
    if (c) {
      this.form.patchValue({
        name: c.name,
        phone: c.phone,
        address: c.address,
        openingBalance: c.openingBalance,
        status: c.status,
      });
    } else {
      this.form.reset({ status: 'active', openingBalance: 0 });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const c = this.customer();
    this.saved.emit({
      ...(c ? { id: c.id } : {}),
      name: val.name ?? '',
      phone: val.phone ?? '',
      address: val.address ?? '',
      openingBalance: val.openingBalance ?? 0,
      status: (val.status as 'active' | 'inactive') ?? 'active',
    });
    this.form.reset({ status: 'active', openingBalance: 0 });
  }
}
