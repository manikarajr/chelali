import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input
          type="text"
          formControlName="name"
          placeholder="Enter customer name"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        @if (form.get('name')?.invalid && form.get('name')?.touched) {
          <p class="text-xs text-red-500 mt-1">Name is required.</p>
        }
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <input
          type="tel"
          formControlName="phone"
          placeholder="10-digit mobile number"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
          <p class="text-xs text-red-500 mt-1">Valid phone number is required.</p>
        }
      </div>

      <!-- Address -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          formControlName="address"
          rows="3"
          placeholder="Enter address"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
      </div>

      <!-- Opening Balance -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Opening Balance (₹)</label>
        <input
          type="number"
          formControlName="openingBalance"
          placeholder="0"
          min="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          formControlName="status"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
          {{ customer() ? 'Update Customer' : 'Add Customer' }}
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
