import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { CustomerService } from '../../core/services/customer.service';
import { Invoice } from '../../core/models/invoice.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { InvoiceViewComponent } from './invoice-view.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, FormsModule, SlidePanelComponent, InvoiceViewComponent],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Invoices</h2>
          <p class="text-sm text-gray-500 mt-0.5 sm:mt-1">Customer billing records</p>
        </div>
        <button
          (click)="createInvoice()"
          class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium
                 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span class="hidden sm:inline">Create Invoice</span>
        </button>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Search -->
        <div class="p-4 border-b border-gray-100">
          <div class="relative w-full sm:max-w-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor"
                 class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <input
              type="text"
              placeholder="Search invoices…"
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
                <th class="px-4 py-3 text-left font-semibold">Invoice #</th>
                <th class="px-4 py-3 text-left font-semibold">Customer</th>
                <th class="px-4 py-3 text-left font-semibold hidden sm:table-cell">Billing Period</th>
                <th class="px-4 py-3 text-right font-semibold">Total</th>
                <th class="px-4 py-3 text-right font-semibold">Outstanding</th>
                <th class="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (inv of filtered(); track inv.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {{ inv.invoiceNumber }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-medium text-gray-900">{{ customerName(inv.customerId) }}</td>
                  <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {{ inv.startDate | date:'dd MMM' }} – {{ inv.endDate | date:'dd MMM yyyy' }}
                  </td>
                  <td class="px-4 py-3 text-right font-medium text-gray-900">
                    {{ inv.totalAmount | currency:'INR':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-4 py-3 text-right font-semibold"
                      [ngClass]="inv.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ inv.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <!-- View -->
                      <button
                        (click)="viewInvoice(inv)"
                        class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      <!-- WhatsApp -->
                      <a
                        [href]="whatsappLink(inv)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Send WhatsApp"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round"
                            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                      </a>

                      <!-- Delete -->
                      <button
                        (click)="delete(inv.id)"
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
                  <td colspan="6" class="px-4 py-12 text-center text-gray-400">No invoices found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {{ filtered().length }} of {{ invoices().length }} invoices
        </div>
      </div>
    </div>

    <!-- View Invoice Slide Panel -->
    <app-slide-panel
      [isOpen]="isPanelOpen()"
      [title]="'Invoice Details'"
      (closed)="closePanel()"
    >
      <app-invoice-view
        [invoice]="selectedInvoice()"
        [customer]="selectedCustomer()"
      ></app-invoice-view>
    </app-slide-panel>

    <!-- Create Invoice Modal (simple) -->
    @if (showCreateModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Create Invoice</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              [(ngModel)]="newInvCustomerId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select customer</option>
              @for (c of customers(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" [(ngModel)]="newInvStart"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" [(ngModel)]="newInvEnd"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="flex gap-3">
            <button
              (click)="confirmCreate()"
              [disabled]="!newInvCustomerId || !newInvStart || !newInvEnd"
              class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Create
            </button>
            <button
              (click)="showCreateModal.set(false)"
              class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class InvoiceListComponent {
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);

  invoices = this.invoiceService.invoices;
  customers = this.customerService.customers;
  searchQuery = signal('');
  isPanelOpen = signal(false);
  selectedInvoice = signal<Invoice | null>(null);
  selectedCustomer = signal<any>(null);
  showCreateModal = signal(false);

  newInvCustomerId = '';
  newInvStart = '';
  newInvEnd = '';

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.invoices();
    return this.invoices().filter(i =>
      i.invoiceNumber.toLowerCase().includes(q) ||
      this.customerName(i.customerId).toLowerCase().includes(q)
    );
  });

  customerName(id: number): string {
    return this.customerService.getById(id)?.name ?? 'Unknown';
  }

  viewInvoice(inv: Invoice): void {
    this.selectedInvoice.set(inv);
    this.selectedCustomer.set(this.customerService.getById(inv.customerId) ?? null);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.selectedInvoice.set(null);
    this.selectedCustomer.set(null);
  }

  createInvoice(): void {
    this.newInvCustomerId = '';
    this.newInvStart = '';
    this.newInvEnd = '';
    this.showCreateModal.set(true);
  }

  confirmCreate(): void {
    if (!this.newInvCustomerId || !this.newInvStart || !this.newInvEnd) return;
    // compute total from transactions for this customer in the date range
    const cId = Number(this.newInvCustomerId);
    const cust = this.customerService.getById(cId);
    const total = cust?.openingBalance ?? 0; // simplified — use opening balance
    this.invoiceService.add({
      customerId: cId,
      startDate: this.newInvStart,
      endDate: this.newInvEnd,
      totalAmount: total,
      outstandingAmount: total,
    });
    this.showCreateModal.set(false);
  }

  whatsappLink(inv: Invoice): string {
    const cust = this.customerService.getById(inv.customerId);
    if (!cust) return '#';
    const phone = cust.phone.replace(/\D/g, '');
    const startFmt = new Date(inv.startDate).toLocaleDateString('en-IN');
    const endFmt = new Date(inv.endDate).toLocaleDateString('en-IN');
    const msg = `Hello ${cust.name},\n\nPlease find your invoice for ice purchases from ${startFmt} to ${endFmt}.\n\nInvoice No: ${inv.invoiceNumber}\nTotal Amount: ₹${inv.totalAmount.toLocaleString('en-IN')}\nOutstanding Balance: ₹${inv.outstandingAmount.toLocaleString('en-IN')}\n\nThank you.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  }

  delete(id: number): void {
    if (confirm('Delete this invoice?')) {
      this.invoiceService.delete(id);
    }
  }
}
