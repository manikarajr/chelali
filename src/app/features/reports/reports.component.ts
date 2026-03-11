import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CustomerService } from '../../core/services/customer.service';

type ReportTab = 'sales' | 'expenses' | 'outstanding' | 'profit';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgClass, CurrencyPipe, DatePipe, TitleCasePipe, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Reports</h2>
          <p class="text-sm text-gray-500 mt-1">Business analytics and summaries</p>
        </div>
        <!-- Export Buttons -->
        <div class="flex gap-2">
          <button
            (click)="exportPDF()"
            class="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm
                   font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-4 h-4 text-red-500">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export PDF
          </button>
          <button
            (click)="exportExcel()"
            class="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm
                   font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-4 h-4 text-green-600">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Filter</label>
          <select
            [(ngModel)]="filterType"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                   focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        @if (filterType === 'monthly') {
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Month</label>
            <input
              type="month"
              [(ngModel)]="selectedMonth"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
            />
          </div>
        } @else {
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">From</label>
            <input
              type="date"
              [(ngModel)]="dateFrom"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">To</label>
            <input
              type="date"
              [(ngModel)]="dateTo"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
            />
          </div>
        }
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Total Sales</p>
          <p class="text-2xl font-bold text-gray-900">{{ filteredSales() | currency:'INR':'symbol':'1.0-0' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Total Expenses</p>
          <p class="text-2xl font-bold text-gray-900">{{ filteredExpenses() | currency:'INR':'symbol':'1.0-0' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Outstanding</p>
          <p class="text-2xl font-bold text-red-600">{{ totalOutstanding() | currency:'INR':'symbol':'1.0-0' }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Net Profit</p>
          <p class="text-2xl font-bold" [ngClass]="netProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'">
            {{ netProfit() | currency:'INR':'symbol':'1.0-0' }}
          </p>
        </div>
      </div>

      <!-- Report Tabs -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          @for (tab of tabs; track tab.value) {
            <button
              (click)="activeTab.set(tab.value)"
              class="px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
              [ngClass]="activeTab() === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Sales Summary Tab -->
        @if (activeTab() === 'sales') {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">Date</th>
                  <th class="px-4 py-3 text-left font-semibold">Customer</th>
                  <th class="px-4 py-3 text-right font-semibold">Qty (kg)</th>
                  <th class="px-4 py-3 text-right font-semibold">Total</th>
                  <th class="px-4 py-3 text-right font-semibold">Collected</th>
                  <th class="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (t of filteredTransactions(); track t.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-gray-500">{{ t.date | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3 font-medium text-gray-900">{{ customerName(t.customerId) }}</td>
                    <td class="px-4 py-3 text-right text-gray-700">{{ t.quantity }}</td>
                    <td class="px-4 py-3 text-right font-medium text-gray-900">
                      {{ t.totalAmount | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-4 py-3 text-right text-green-600">
                      {{ t.paidAmount | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="{
                              'bg-green-100 text-green-800': t.paymentStatus === 'paid',
                              'bg-yellow-100 text-yellow-800': t.paymentStatus === 'partial',
                              'bg-red-100 text-red-800': t.paymentStatus === 'unpaid'
                            }">
                        {{ t.paymentStatus | titlecase }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-4 py-10 text-center text-gray-400">No sales data for selected period.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Expense Summary Tab -->
        @if (activeTab() === 'expenses') {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">Date</th>
                  <th class="px-4 py-3 text-left font-semibold">Category</th>
                  <th class="px-4 py-3 text-right font-semibold">Amount</th>
                  <th class="px-4 py-3 text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (e of filteredExpenseItems(); track e.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-gray-500">{{ e.date | date:'dd MMM yyyy' }}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {{ e.category | titlecase }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-semibold text-gray-900">
                      {{ e.amount | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-4 py-3 text-gray-500 max-w-xs truncate">{{ e.notes || '—' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-10 text-center text-gray-400">No expense data for selected period.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Outstanding Tab -->
        @if (activeTab() === 'outstanding') {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">Customer</th>
                  <th class="px-4 py-3 text-left font-semibold">Phone</th>
                  <th class="px-4 py-3 text-right font-semibold">Total Billed</th>
                  <th class="px-4 py-3 text-right font-semibold">Paid</th>
                  <th class="px-4 py-3 text-right font-semibold">Outstanding</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (row of customerOutstanding(); track row.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ row.name }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ row.phone }}</td>
                    <td class="px-4 py-3 text-right text-gray-700">
                      {{ row.totalBilled | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-4 py-3 text-right text-green-600">
                      {{ row.paid | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                    <td class="px-4 py-3 text-right font-bold"
                        [ngClass]="row.outstanding > 0 ? 'text-red-600' : 'text-gray-400'">
                      {{ row.outstanding | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-4 py-10 text-center text-gray-400">No outstanding amounts.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Profit/Loss Tab -->
        @if (activeTab() === 'profit') {
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div class="bg-green-50 border border-green-200 rounded-xl p-5">
                <p class="text-sm text-green-700 font-medium mb-1">Total Revenue</p>
                <p class="text-3xl font-bold text-green-800">
                  {{ filteredSales() | currency:'INR':'symbol':'1.0-0' }}
                </p>
              </div>
              <div class="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <p class="text-sm text-orange-700 font-medium mb-1">Total Expenses</p>
                <p class="text-3xl font-bold text-orange-800">
                  {{ filteredExpenses() | currency:'INR':'symbol':'1.0-0' }}
                </p>
              </div>
              <div class="rounded-xl p-5 border"
                   [ngClass]="netProfit() >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'">
                <p class="text-sm font-medium mb-1"
                   [ngClass]="netProfit() >= 0 ? 'text-emerald-700' : 'text-red-700'">
                  {{ netProfit() >= 0 ? 'Net Profit' : 'Net Loss' }}
                </p>
                <p class="text-3xl font-bold"
                   [ngClass]="netProfit() >= 0 ? 'text-emerald-800' : 'text-red-800'">
                  {{ netProfit() | currency:'INR':'symbol':'1.0-0' }}
                </p>
              </div>
            </div>

            <!-- P&L breakdown -->
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <table class="w-full text-sm">
                <tbody>
                  <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="px-4 py-3 text-gray-700 font-medium">Total Sales</td>
                    <td class="px-4 py-3 text-right text-green-600 font-semibold">
                      + {{ filteredSales() | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                  </tr>
                  <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="px-4 py-3 text-gray-700 font-medium">Total Expenses</td>
                    <td class="px-4 py-3 text-right text-red-600 font-semibold">
                      – {{ filteredExpenses() | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                  </tr>
                  <tr class="bg-gray-50">
                    <td class="px-4 py-3 font-bold text-gray-900">Net Profit / Loss</td>
                    <td class="px-4 py-3 text-right font-bold text-lg"
                        [ngClass]="netProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'">
                      {{ netProfit() | currency:'INR':'symbol':'1.0-0' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,
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
    { value: 'sales' as ReportTab, label: 'Sales Summary' },
    { value: 'expenses' as ReportTab, label: 'Expense Summary' },
    { value: 'outstanding' as ReportTab, label: 'Outstanding' },
    { value: 'profit' as ReportTab, label: 'Profit / Loss' },
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
