import { Component, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Invoice } from '../../core/models/invoice.model';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    @if (invoice(); as inv) {
      <div class="space-y-6" id="invoice-print">
        <!-- Invoice Header -->
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ inv.invoiceNumber }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              Period: {{ inv.startDate | date:'dd MMM yyyy' }} – {{ inv.endDate | date:'dd MMM yyyy' }}
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-semibold"
                [class]="inv.outstandingAmount === 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'">
            {{ inv.outstandingAmount === 0 ? 'Paid' : 'Outstanding' }}
          </span>
        </div>

        <!-- Company Info -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="font-bold text-blue-900 text-lg">Chelali Ice Plant</p>
          <p class="text-sm text-blue-700">Ice Manufacturing & Supply</p>
          <p class="text-sm text-blue-600 mt-1">GSTIN: 29ABCDE1234F1Z5</p>
        </div>

        <!-- Customer Info -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Bill To</p>
          @if (customer(); as cust) {
            <p class="font-semibold text-gray-900">{{ cust.name }}</p>
            <p class="text-sm text-gray-600">{{ cust.phone }}</p>
            <p class="text-sm text-gray-600">{{ cust.address }}</p>
          }
        </div>

        <!-- Amount Summary -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-600">Description</th>
                <th class="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-gray-100">
                <td class="px-4 py-3 text-gray-700">Ice Supply Charges</td>
                <td class="px-4 py-3 text-right font-medium text-gray-900">
                  {{ inv.totalAmount | currency:'INR':'symbol':'1.0-0' }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td class="px-4 py-3 font-bold text-gray-900">Total Amount</td>
                <td class="px-4 py-3 text-right font-bold text-gray-900">
                  {{ inv.totalAmount | currency:'INR':'symbol':'1.0-0' }}
                </td>
              </tr>
              <tr class="border-t border-gray-100">
                <td class="px-4 py-3 text-gray-600">Outstanding Balance</td>
                <td class="px-4 py-3 text-right font-bold"
                    [class]="inv.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'">
                  {{ inv.outstandingAmount | currency:'INR':'symbol':'1.0-0' }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <button
            (click)="printInvoice()"
            class="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm
                   font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download / Print Invoice
          </button>

          @if (customer(); as cust) {
            <a
              [href]="whatsappLink(inv, cust)"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm
                     font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                   stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Send via WhatsApp
            </a>
          }
        </div>

        <!-- Footer note -->
        <p class="text-xs text-gray-400 text-center">
          Thank you for your business. Please pay within 7 days.
        </p>
      </div>
    }
  `,
})
export class InvoiceViewComponent {
  invoice = input<Invoice | null>(null);
  customer = input<Customer | null>(null);

  whatsappLink(inv: Invoice, cust: Customer): string {
    const phone = cust.phone.replace(/\D/g, '');
    const startFmt = new Date(inv.startDate).toLocaleDateString('en-IN');
    const endFmt = new Date(inv.endDate).toLocaleDateString('en-IN');
    const msg = `Hello ${cust.name},\n\nPlease find your invoice for ice purchases from ${startFmt} to ${endFmt}.\n\nInvoice No: ${inv.invoiceNumber}\nTotal Amount: ₹${inv.totalAmount.toLocaleString('en-IN')}\nOutstanding Balance: ₹${inv.outstandingAmount.toLocaleString('en-IN')}\n\nThank you.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  }

  printInvoice(): void {
    window.print();
  }
}
