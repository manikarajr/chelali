import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { TransactionService } from '../../core/services/transaction.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CustomerService } from '../../core/services/customer.service';
import * as XLSX from 'xlsx';

type ReportTab = 'sales' | 'expenses' | 'outstanding' | 'profit';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgClass, CurrencyPipe, TitleCasePipe, FormsModule, DataTableComponent],
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  private txService = inject(TransactionService);
  private expenseService = inject(ExpenseService);
  private customerService = inject(CustomerService);

  activeTab = signal<ReportTab>('sales');
  filterType = 'monthly';
  selectedMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  dateFrom = '';
  dateTo = '';

  tabs = [
    { value: 'sales' as ReportTab, label: 'Sales Summary', shortLabel: 'Sales' },
    { value: 'expenses' as ReportTab, label: 'Expense Summary', shortLabel: 'Expenses' },
    { value: 'outstanding' as ReportTab, label: 'Outstanding', shortLabel: 'Due' },
    { value: 'profit' as ReportTab, label: 'Profit / Loss', shortLabel: 'P&L' },
  ];

  salesColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'customerName', label: 'Customer', type: 'text' },
    { key: 'quantity', label: 'Qty (kg)', type: 'number', className: 'text-right' },
    { key: 'totalAmount', label: 'Total', type: 'currency', className: 'text-right' },
    { key: 'paidAmount', label: 'Collected', type: 'currency', className: 'text-right text-green-600' },
    { key: 'paymentStatus', label: 'Status', type: 'status', className: 'text-center' },
  ];

  expenseColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'category', label: 'Category', type: 'status' },
    { key: 'amount', label: 'Amount', type: 'currency', className: 'text-right font-semibold' },
    { key: 'notes', label: 'Notes', type: 'text', className: 'max-w-xs truncate text-gray-500' },
  ];

  outstandingColumns: TableColumn[] = [
    { key: 'name', label: 'Customer', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text', className: 'text-gray-500' },
    { key: 'totalBilled', label: 'Total Billed', type: 'currency', className: 'text-right text-gray-700' },
    { key: 'paid', label: 'Paid', type: 'currency', className: 'text-right text-green-600' },
    { key: 'outstanding', label: 'Outstanding', type: 'currency', className: 'text-right font-bold' },
  ];

  private inRange(dateStr: string): boolean {
    const d = new Date(dateStr);
    if (this.filterType === 'monthly') {
      const [y, m] = this.selectedMonth.split('-').map(Number);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    }
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to = this.dateTo ? new Date(this.dateTo) : null;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }

  filteredTransactions = computed(() =>
    this.txService.transactions().filter(t => this.inRange(t.date))
  );

  mappedSales = computed(() =>
    this.filteredTransactions().map(t => ({
      ...t,
      customerName: this.customerName(t.customerId)
    }))
  );

  filteredExpenseItems = computed(() =>
    this.expenseService.expenses().filter(e => this.inRange(e.date))
  );

  filteredSales = computed(() =>
    this.filteredTransactions().reduce((s, t) => s + t.totalAmount, 0)
  );

  filteredExpenses = computed(() =>
    this.filteredExpenseItems().reduce((s, e) => s + e.amount, 0)
  );

  totalOutstanding = computed(() =>
    this.txService.transactions().reduce((s, t) => s + t.outstandingAmount, 0)
  );

  netProfit = computed(() => this.filteredSales() - this.filteredExpenses());

  customerOutstanding = computed(() =>
    this.customerService.customers()
      .map(c => {
        const txs = this.txService.transactions().filter(t => t.customerId === c.id);
        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          totalBilled: txs.reduce((s, t) => s + t.totalAmount, 0),
          paid: txs.reduce((s, t) => s + t.paidAmount, 0),
          outstanding: txs.reduce((s, t) => s + t.outstandingAmount, 0),
        };
      })
      .filter(r => r.outstanding > 0)
  );

  customerName(id: number): string {
    return this.customerService.getById(id)?.name ?? 'Unknown';
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private formatCurrency(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  private periodLabel(): string {
    if (this.filterType === 'monthly') {
      const [y, m] = this.selectedMonth.split('-');
      const date = new Date(Number(y), Number(m) - 1, 1);
      return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }
    return `${this.dateFrom || 'Start'} to ${this.dateTo || 'End'}`;
  }

  exportExcel(): void {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Sales Summary ──
    const salesRows = this.mappedSales().map(t => ({
      'Date': this.formatDate(t.date),
      'Customer': t.customerName,
      'Qty (kg)': t.quantity,
      'Total Amount': this.formatCurrency(t.totalAmount),
      'Collected Amount': this.formatCurrency(t.paidAmount),
      'Status': t.paymentStatus.charAt(0).toUpperCase() + t.paymentStatus.slice(1),
    }));
    const wsSales = XLSX.utils.json_to_sheet(salesRows);
    XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Summary');

    // ── Sheet 2: Expense Summary ──
    const expenseRows = this.filteredExpenseItems().map(e => ({
      'Date': this.formatDate(e.date),
      'Category': e.category.charAt(0).toUpperCase() + e.category.slice(1),
      'Description': e.notes || '-',
      'Amount': this.formatCurrency(e.amount),
    }));
    const wsExpense = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(wb, wsExpense, 'Expense Summary');

    // ── Sheet 3: Outstanding ──
    const outstandingRows = this.customerOutstanding().map(c => ({
      'Customer': c.name,
      'Total Sales': this.formatCurrency(c.totalBilled),
      'Collected': this.formatCurrency(c.paid),
      'Outstanding Amount': this.formatCurrency(c.outstanding),
    }));
    const wsOutstanding = XLSX.utils.json_to_sheet(outstandingRows);
    XLSX.utils.book_append_sheet(wb, wsOutstanding, 'Outstanding');

    // ── Sheet 4: Profit Loss ──
    const plRows = [
      { 'Metric': 'Total Sales', 'Amount': this.formatCurrency(this.filteredSales()) },
      { 'Metric': 'Total Expenses', 'Amount': this.formatCurrency(this.filteredExpenses()) },
      { 'Metric': 'Total Outstanding', 'Amount': this.formatCurrency(this.totalOutstanding()) },
      { 'Metric': 'Net Profit / Loss', 'Amount': this.formatCurrency(this.netProfit()) },
    ];
    const wsPL = XLSX.utils.json_to_sheet(plRows);
    XLSX.utils.book_append_sheet(wb, wsPL, 'Profit Loss');

    // ── Sheet 5: Detailed Sales ──
    const detailedRows = this.mappedSales().map(t => ({
      'Date': this.formatDate(t.date),
      'Customer': t.customerName,
      'Qty (kg)': t.quantity,
      'Total Amount': this.formatCurrency(t.totalAmount),
      'Collected Amount': this.formatCurrency(t.paidAmount),
      'Outstanding Amount': this.formatCurrency(t.outstandingAmount),
      'Status': t.paymentStatus.charAt(0).toUpperCase() + t.paymentStatus.slice(1),
    }));
    const wsDetailed = XLSX.utils.json_to_sheet(detailedRows);
    XLSX.utils.book_append_sheet(wb, wsDetailed, 'Detailed Sales');

    // ── Generate file name ──
    const period = this.periodLabel().replace(/\s+/g, '_');
    const fileName = `IcePlant_Report_${period}.xlsx`;

    XLSX.writeFile(wb, fileName);
  }
}
