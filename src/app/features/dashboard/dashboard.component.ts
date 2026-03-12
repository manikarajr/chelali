import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { TransactionService } from '../../core/services/transaction.service';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private customerService = inject(CustomerService);
  private transactionService = inject(TransactionService);
  private expenseService = inject(ExpenseService);

  totalCustomers = computed(() => this.customerService.customers().length);
  activeCustomers = computed(() => this.customerService.customers().filter(c => c.status === 'active').length);

  totalOutstanding = computed(() =>
    this.transactionService.transactions().reduce((sum, t) => sum + t.outstandingAmount, 0)
  );

  monthlySales = computed(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.transactionService.transactions()
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + t.totalAmount, 0);
  });

  monthlyExpenses = computed(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return this.expenseService.expenses()
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  });

  profitLoss = computed(() => this.monthlySales() - this.monthlyExpenses());
}
