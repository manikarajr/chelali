import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { CustomerService } from '../../core/services/customer.service';
import { Invoice } from '../../core/models/invoice.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { InvoiceViewComponent } from './invoice-view.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, FormsModule, SlidePanelComponent, InvoiceViewComponent, DataTableComponent],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent {
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);

  invoices = this.invoiceService.invoices;
  customers = this.customerService.customers;
  isPanelOpen = signal(false);
  selectedInvoice = signal<Invoice | null>(null);
  selectedCustomer = signal<any>(null);
  showCreateModal = signal(false);

  newInvCustomerId = '';
  newInvStart = '';
  newInvEnd = '';

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', className: 'font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700' },
    { key: 'customerId', label: 'Customer', className: 'font-medium text-gray-900' },
    { key: 'billingPeriod', label: 'Billing Period', className: 'text-gray-500', hiddenSm: true },
    { key: 'totalAmount', label: 'Total', type: 'currency', className: 'text-right font-medium text-gray-900' },
    { key: 'outstandingAmount', label: 'Outstanding', type: 'currency', className: 'text-right font-semibold' },
    { key: 'actions', label: 'Actions', type: 'actions', className: 'text-center' }
  ];

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
