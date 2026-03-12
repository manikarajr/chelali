import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { TransactionService } from '../../core/services/transaction.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CustomerService } from '../../core/services/customer.service';

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

  exportPDF(): void {
    window.print();
  }

  exportExcel(): void {
    alert('Excel export: integrate a library like xlsx or sheetjs for production use.');
  }
}
