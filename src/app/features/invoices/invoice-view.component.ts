import { Component, inject, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Invoice } from '../../core/models/invoice.model';
import { Customer } from '../../core/models/customer.model';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './invoice-view.component.html',
})
export class InvoiceViewComponent {
  invoice = input<Invoice | null>(null);
  customer = input<Customer | null>(null);

  whatsappLink(): string {
    const inv = this.invoice();
    const cust = this.customer();
    if (!inv || !cust) return '#';
    const phone = cust.phone.replace(/\D/g, '');
    const startFmt = new Date(inv.startDate).toLocaleDateString('en-IN');
    const endFmt = new Date(inv.endDate).toLocaleDateString('en-IN');
    const msg = `Hello ${cust.name},\n\nInvoice for ice purchases from ${startFmt} to ${endFmt}.\n\nInvoice No: ${inv.invoiceNumber}\nPrevious Outstanding: ₹${inv.previousOutstanding.toLocaleString('en-IN')}\nCurrent Purchases: ₹${inv.currentPurchases.toLocaleString('en-IN')}\nPayments Received: ₹${inv.paymentsReceived.toLocaleString('en-IN')}\nTotal Balance: ₹${inv.totalOutstanding.toLocaleString('en-IN')}\n\nThank you.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  }

  generatePDF(): void {
    // PDF Library jspdf would be used here
    // For now, simple print or alert
    window.print();
  }
}
