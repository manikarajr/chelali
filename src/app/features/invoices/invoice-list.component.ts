import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { CustomerService } from '../../core/services/customer.service';
import { Invoice } from '../../core/models/invoice.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { InvoiceViewComponent } from './invoice-view.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, FormsModule, SlidePanelComponent, InvoiceViewComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent {
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);

  invoices = this.invoiceService.invoices;
  customers = this.customerService.customers;
  isPanelOpen = signal(false);
  selectedInvoice = signal<Invoice | null>(null);
  deleteTargetId = signal<number | null>(null);
  selectedCustomer = signal<any>(null);
  showCreateModal = signal(false);
  showConfirmCreate = signal(false);

  // Generation Modal State
  newInvCustomerId = signal<string>('');
  newInvStart = signal<string>('');
  newInvEnd = signal<string>('');
  generationMode = signal<'smart' | 'custom'>('smart');

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'Invoice #', className: 'font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700' },
    { key: 'customerId', label: 'Customer', className: 'font-medium text-gray-900' },
    { key: 'billingPeriod', label: 'Billing Period', className: 'text-gray-500', hiddenSm: true },
    { key: 'totalOutstanding', label: 'Outstanding Balance', type: 'currency', className: 'text-right font-semibold' },
    { key: 'actions', label: 'Actions', type: 'actions', className: 'text-center' }
  ];

  customerName(id: number): string {
    return this.customerService.getById(id)?.name ?? 'Unknown';
  }

  onCustomerSelect(cId: string): void {
    this.newInvCustomerId.set(cId);
    if (!cId) return;

    const cust = this.customerService.getById(Number(cId));
    if (!cust) return;

    // Smart defaults
    const today = new Date().toISOString().split('T')[0];
    const lastDate = cust.lastInvoiceDate;

    if (lastDate) {
      // Start = day after last invoice
      const start = new Date(lastDate);
      start.setDate(start.getDate() + 1);
      this.newInvStart.set(start.toISOString().split('T')[0]);
      this.newInvEnd.set(today);
      this.generationMode.set('smart');
    } else {
      // No previous invoice: default to 1st of current month
      const firstDay = new Date();
      firstDay.setDate(1);
      this.newInvStart.set(firstDay.toISOString().split('T')[0]);
      this.newInvEnd.set(today);
      this.generationMode.set('custom');
    }
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
    this.newInvCustomerId.set('');
    this.newInvStart.set('');
    this.newInvEnd.set('');
    this.showCreateModal.set(true);
  }

  onCreateSubmit(): void {
    if (!this.newInvCustomerId() || !this.newInvStart() || !this.newInvEnd()) return;
    this.showCreateModal.set(false);
    this.showConfirmCreate.set(true);
  }

  confirmCreate(): void {
    this.invoiceService.add({
      customerId: Number(this.newInvCustomerId()),
      startDate: this.newInvStart(),
      endDate: this.newInvEnd(),
    });
    this.showConfirmCreate.set(false);
    this.resetCreateForm();
  }

  private resetCreateForm(): void {
    this.newInvCustomerId.set('');
    this.newInvStart.set('');
    this.newInvEnd.set('');
  }

  cancelCreate(): void {
    this.showConfirmCreate.set(false);
    this.showCreateModal.set(true);
  }

  whatsappLink(inv: Invoice): string {
    const cust = this.customerService.getById(inv.customerId);
    if (!cust) return '#';
    const phone = cust.phone.replace(/\D/g, '');
    const startFmt = new Date(inv.startDate).toLocaleDateString('en-IN');
    const endFmt = new Date(inv.endDate).toLocaleDateString('en-IN');
    const msg = `Hello ${cust.name},\n\nInvoice for ice purchases from ${startFmt} to ${endFmt}.\n\nInvoice No: ${inv.invoiceNumber}\nPrevious Outstanding: ₹${inv.previousOutstanding.toLocaleString('en-IN')}\nCurrent Purchases: ₹${inv.currentPurchases.toLocaleString('en-IN')}\nPayments Received: ₹${inv.paymentsReceived.toLocaleString('en-IN')}\nTotal Balance: ₹${inv.totalOutstanding.toLocaleString('en-IN')}\n\nThank you.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  }

  delete(id: number): void {
    this.deleteTargetId.set(id);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id !== null) this.invoiceService.delete(id);
    this.deleteTargetId.set(null);
  }

  cancelDelete(): void {
    this.deleteTargetId.set(null);
  }
}
