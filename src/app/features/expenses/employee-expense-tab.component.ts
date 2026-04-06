import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { EmployeeExpenseService } from '../../core/services/employee-expense.service';
import { EmployeeService } from '../../core/services/employee.service';
import { EmployeeExpense } from '../../core/models/employee-expense.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { EmployeePaymentFormComponent } from './employee-payment-form.component';
import { EmployeeManagementPanelComponent } from './employee-management-panel.component';

const PAYMENT_COLORS: Record<string, string> = {
  salary:    'bg-blue-100 text-blue-800',
  advance:   'bg-orange-100 text-orange-800',
  allowance: 'bg-green-100 text-green-800',
};

@Component({
  selector: 'app-employee-expense-tab',
  standalone: true,
  imports: [
    NgClass, CurrencyPipe, TitleCasePipe,
    SlidePanelComponent, ConfirmDialogComponent, DataTableComponent,
    EmployeePaymentFormComponent, EmployeeManagementPanelComponent,
  ],
  templateUrl: './employee-expense-tab.component.html',
})
export class EmployeeExpenseTabComponent {
  private expenseService  = inject(EmployeeExpenseService);
  private employeeService = inject(EmployeeService);

  expenses       = this.expenseService.expenses;
  employees      = this.employeeService.employees;
  activeEmployees = computed(() => this.employees().filter(e => e.status === 'active'));

  isPanelOpen        = signal(false);
  isEmployeePanelOpen = signal(false);
  editingExpense     = signal<EmployeeExpense | null>(null);
  deleteTargetId     = signal<number | null>(null);
  isConfirmSaveOpen  = signal(false);
  isAdvanceWarningOpen = signal(false);
  advanceWarningMessage = signal('');
  pendingSaveData    = signal<(Omit<EmployeeExpense, 'id'> & { id?: number }) | null>(null);

  columns: TableColumn[] = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'paymentType',  label: 'Type',    type: 'status' },
    { key: 'date',         label: 'Date',    type: 'date',     className: 'text-gray-500', hiddenSm: true },
    { key: 'amount',       label: 'Amount',  type: 'currency', className: 'text-right font-semibold text-gray-900' },
    { key: 'notes',        label: 'Notes',   className: 'text-gray-500 max-w-xs truncate', hiddenMd: true },
    { key: 'actions',      label: 'Actions', type: 'actions',  className: 'text-center' },
  ];

  enrichedExpenses = computed(() => {
    const emps = this.employees();
    return this.expenses().map(e => ({
      ...e,
      employeeName: emps.find(em => em.id === e.employeeId)?.name ?? 'Unknown',
    }));
  });

  monthlySummary = computed(() => {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;
    const curr  = this.expenses().filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
    return {
      salary:    curr.filter(e => e.paymentType === 'salary').reduce((s, e)    => s + e.amount, 0),
      advance:   curr.filter(e => e.paymentType === 'advance').reduce((s, e)   => s + e.amount, 0),
      allowance: curr.filter(e => e.paymentType === 'allowance').reduce((s, e) => s + e.amount, 0),
      total:     curr.reduce((s, e) => s + e.amount, 0),
    };
  });

  employeeReport = computed(() => {
    const now   = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;
    return this.employees().map(emp => {
      const curr = this.expenses().filter(e => {
        const d = new Date(e.date);
        return e.employeeId === emp.id && d.getFullYear() === year && d.getMonth() + 1 === month;
      });
      const salary    = curr.filter(e => e.paymentType === 'salary').reduce((s, e)    => s + e.amount, 0);
      const advance   = curr.filter(e => e.paymentType === 'advance').reduce((s, e)   => s + e.amount, 0);
      const allowance = curr.filter(e => e.paymentType === 'allowance').reduce((s, e) => s + e.amount, 0);
      const netPayable = emp.basicSalary + allowance - advance - salary;
      return { emp, salary, advance, allowance, netPayable };
    });
  });

  paymentTypeColor(type: string): string {
    return PAYMENT_COLORS[type] ?? 'bg-gray-100 text-gray-700';
  }

  openAdd(): void {
    this.editingExpense.set(null);
    this.isPanelOpen.set(true);
  }

  openEdit(e: EmployeeExpense): void {
    this.editingExpense.set(e);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.editingExpense.set(null);
  }

  onFormSaved(data: Omit<EmployeeExpense, 'id'> & { id?: number }): void {
    this.pendingSaveData.set(data);
    this.closePanel();

    // Advance limit check
    if (data.paymentType === 'advance') {
      const employee = this.employeeService.getById(data.employeeId);
      if (employee) {
        const d = new Date(data.date);
        const existing = this.expenseService.getMonthlyAdvance(
          data.employeeId,
          d.getFullYear(),
          d.getMonth() + 1,
          data.id,          // exclude current record when editing
        );
        const total = existing + data.amount;
        if (total > employee.basicSalary) {
          this.advanceWarningMessage.set(
            `The total advance for ${employee.name} this month will be ` +
            `₹${total.toLocaleString('en-IN')}, which exceeds their monthly salary of ` +
            `₹${employee.basicSalary.toLocaleString('en-IN')}. Do you want to proceed?`
          );
          this.isAdvanceWarningOpen.set(true);
          return;
        }
      }
    }
    this.isConfirmSaveOpen.set(true);
  }

  onAdvanceWarningConfirmed(): void {
    this.isAdvanceWarningOpen.set(false);
    this.isConfirmSaveOpen.set(true);
  }

  confirmSave(): void {
    const data = this.pendingSaveData();
    if (data) {
      if (data.id !== undefined) {
        this.expenseService.update(data as EmployeeExpense);
      } else {
        const { id: _id, ...rest } = data;
        this.expenseService.add(rest);
      }
    }
    this.isConfirmSaveOpen.set(false);
    this.pendingSaveData.set(null);
  }

  cancelSave(): void {
    this.isConfirmSaveOpen.set(false);
    this.pendingSaveData.set(null);
  }

  delete(id: number): void { this.deleteTargetId.set(id); }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id !== null) this.expenseService.delete(id);
    this.deleteTargetId.set(null);
  }

  cancelDelete(): void { this.deleteTargetId.set(null); }
}
