import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { CustomerFormComponent } from './customer-form.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [NgClass, DecimalPipe, SlidePanelComponent, CustomerFormComponent],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Customers</h2>
          <p class="text-sm text-gray-500 mt-1">Manage your customer accounts</p>
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
          Add Customer
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
              placeholder="Search customers…"
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
                <th class="px-4 py-3 text-left font-semibold">#</th>
                <th class="px-4 py-3 text-left font-semibold">Name</th>
                <th class="px-4 py-3 text-left font-semibold">Phone</th>
                <th class="px-4 py-3 text-left font-semibold hidden md:table-cell">Address</th>
                <th class="px-4 py-3 text-right font-semibold hidden sm:table-cell">Opening Balance</th>
                <th class="px-4 py-3 text-center font-semibold">Status</th>
                <th class="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (customer of filtered(); track customer.id; let i = $index) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 text-gray-400">{{ i + 1 }}</td>
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-900">{{ customer.name }}</p>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ customer.phone }}</td>
                  <td class="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                    {{ customer.address || '—' }}
                  </td>
                  <td class="px-4 py-3 text-right hidden sm:table-cell text-gray-700">
                    ₹{{ customer.openingBalance | number }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="customer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'">
                      {{ customer.status === 'active' ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        (click)="openEdit(customer)"
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
                        (click)="delete(customer.id)"
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
                  <td colspan="7" class="px-4 py-12 text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" class="w-10 h-10 mx-auto mb-2 text-gray-300">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    No customers found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {{ filtered().length }} of {{ customers().length }} customers
        </div>
      </div>
    </div>

    <!-- Slide Panel -->
    <app-slide-panel
      [isOpen]="isPanelOpen()"
      [title]="editingCustomer() ? 'Edit Customer' : 'Add Customer'"
      (closed)="closePanel()"
    >
      <app-customer-form
        [customer]="editingCustomer()"
        (saved)="onSaved($event)"
        (cancelled)="closePanel()"
      ></app-customer-form>
    </app-slide-panel>
  `,
})
export class CustomerListComponent {
  private customerService = inject(CustomerService);

  customers = this.customerService.customers;
  searchQuery = signal('');
  isPanelOpen = signal(false);
  editingCustomer = signal<Customer | null>(null);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.customers();
    return this.customers().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  openAdd(): void {
    this.editingCustomer.set(null);
    this.isPanelOpen.set(true);
  }

  openEdit(customer: Customer): void {
    this.editingCustomer.set(customer);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.editingCustomer.set(null);
  }

  onSaved(data: Omit<Customer, 'id'> & { id?: number }): void {
    if (data.id !== undefined) {
      this.customerService.update(data as Customer);
    } else {
      const { id: _id, ...rest } = data;
      this.customerService.add(rest);
    }
    this.closePanel();
  }

  delete(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.delete(id);
    }
  }
}
