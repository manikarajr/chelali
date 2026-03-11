import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { CustomerService } from '../../core/services/customer.service';
import { Payment } from '../../core/models/payment.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { PaymentFormComponent } from './payment-form.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, TitleCasePipe, SlidePanelComponent, PaymentFormComponent],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Payments</h2>
          <p class="text-sm text-gray-500 mt-1">Customer payment records</p>
        </div>
        <button
          (click)="openAdd()"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium
                 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Record Payment
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Search -->
        <div class="p-4 border-b border-gray-100">
          <div class="relative max-w-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor"
                 class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer…"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              class="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
              <tr>
                <th class="px-4 py-3 text-left font-semibold">Customer</th>
                <th class="px-4 py-3 text-left font-semibold hidden sm:table-cell">Date</th>
                <th class="px-4 py-3 text-right font-semibold">Amount</th>
                <th class="px-4 py-3 text-center font-semibold hidden sm:table-cell">Method</th>
                <th class="px-4 py-3 text-left font-semibold hidden lg:table-cell">Notes</th>
                <th class="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (p of filtered(); track p.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ customerName(p.customerId) }}</td>
                  <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{{ p.date | date:'dd MMM yyyy' }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-green-700">
                    {{ p.amount | currency:'INR':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-4 py-3 text-center hidden sm:table-cell">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800': p.method === 'cash',
                            'bg-blue-100 text-blue-800': p.method === 'bank',
                            'bg-purple-100 text-purple-800': p.method === 'online'
                          }">
                      {{ p.method | titlecase }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500 hidden lg:table-cell max-w-xs truncate">
                    {{ p.notes || '—' }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        (click)="openEdit(p)"
                        class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button
                        (click)="delete(p.id)"
                        class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-12 text-center text-gray-400">No payments found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {{ filtered().length }} of {{ payments().length }} payments
        </div>
      </div>
    </div>

    <!-- Slide Panel -->
    <app-slide-panel
      [isOpen]="isPanelOpen()"
      [title]="editingPayment() ? 'Edit Payment' : 'Record Payment'"
      (closed)="closePanel()"
    >
      <app-payment-form
        [payment]="editingPayment()"
        [customers]="customers()"
        (saved)="onSaved($event)"
        (cancelled)="closePanel()"
      ></app-payment-form>
    </app-slide-panel>
  `,
})
export class PaymentListComponent {
  private paymentService = inject(PaymentService);
  private customerService = inject(CustomerService);

  payments = this.paymentService.payments;
  customers = this.customerService.customers;
  searchQuery = signal('');
  isPanelOpen = signal(false);
  editingPayment = signal<Payment | null>(null);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.payments();
    return this.payments().filter(p =>
      this.customerName(p.customerId).toLowerCase().includes(q)
    );
  });

  customerName(id: number): string {
    return this.customerService.getById(id)?.name ?? 'Unknown';
  }

  openAdd(): void {
    this.editingPayment.set(null);
    this.isPanelOpen.set(true);
  }

  openEdit(p: Payment): void {
    this.editingPayment.set(p);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.editingPayment.set(null);
  }

  onSaved(data: Omit<Payment, 'id'> & { id?: number }): void {
    if (data.id !== undefined) {
      this.paymentService.update(data as Payment);
    } else {
      const { id: _id, ...rest } = data;
      this.paymentService.add(rest);
    }
    this.closePanel();
  }

  delete(id: number): void {
    if (confirm('Delete this payment?')) {
      this.paymentService.delete(id);
    }
  }
}
