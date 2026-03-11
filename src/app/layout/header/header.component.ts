import { Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  template: `
    <header class="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-20
                   flex items-center justify-between px-4 lg:px-6">
      <div class="flex items-center gap-3">
        <!-- Hamburger (mobile only) -->
        <button
          class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          (click)="sidebarToggled.emit()"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div>
          <h1 class="text-base lg:text-lg font-semibold text-gray-800">{{ pageTitle }}</h1>
          <p class="text-xs text-gray-400 hidden sm:block">Ice Plant Management System</p>
        </div>
      </div>

      <div class="flex items-center gap-2 lg:gap-4">
        <!-- Date (hidden on small screens) -->
        <span class="hidden md:block text-sm text-gray-500">{{ today }}</span>

        <!-- Notification bell -->
        <button class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        <!-- User avatar -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
          <span class="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  sidebarToggled = output<void>();
  private router = inject(Router);

  get today(): string {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  get pageTitle(): string {
    const url = this.router.url.split('/')[1];
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      customers: 'Customers',
      transactions: 'Transactions',
      payments: 'Payments',
      invoices: 'Invoices',
      expenses: 'Expenses',
      reports: 'Reports',
    };
    return titles[url] ?? 'Dashboard';
  }
}
