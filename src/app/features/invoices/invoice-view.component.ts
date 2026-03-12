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
