import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list.component').then(m => m.CustomerListComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-list.component').then(m => m.TransactionListComponent),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/invoices/invoice-list.component').then(m => m.InvoiceListComponent),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./features/expenses/expense-list.component').then(m => m.ExpenseListComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(m => m.ReportsComponent),
      },
    ],
  },
];
