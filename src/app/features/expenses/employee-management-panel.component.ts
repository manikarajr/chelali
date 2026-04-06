import { Component, inject, signal } from '@angular/core';
import { NgClass, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';
import { EmployeeFormComponent } from './employee-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-management-panel',
  standalone: true,
  imports: [NgClass, CurrencyPipe, TitleCasePipe, EmployeeFormComponent, ConfirmDialogComponent],
  templateUrl: './employee-management-panel.component.html',
})
export class EmployeeManagementPanelComponent {
  private employeeService = inject(EmployeeService);

  employees = this.employeeService.employees;

  editingEmployee = signal<Employee | null>(null);
  isFormOpen      = signal(false);
  deleteTargetId  = signal<number | null>(null);
  isConfirmSaveOpen  = signal(false);
  pendingSaveData    = signal<(Omit<Employee, 'id'> & { id?: number }) | null>(null);

  openAdd(): void {
    this.editingEmployee.set(null);
    this.isFormOpen.set(true);
  }

  openEdit(e: Employee): void {
    this.editingEmployee.set(e);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingEmployee.set(null);
  }

  onFormSaved(data: Omit<Employee, 'id'> & { id?: number }): void {
    this.pendingSaveData.set(data);
    this.isFormOpen.set(false);
    this.editingEmployee.set(null);
    this.isConfirmSaveOpen.set(true);
  }

  confirmSave(): void {
    const data = this.pendingSaveData();
    if (data) {
      if (data.id !== undefined) {
        this.employeeService.update(data as Employee);
      } else {
        const { id: _id, ...rest } = data;
        this.employeeService.add(rest);
      }
    }
    this.isConfirmSaveOpen.set(false);
    this.pendingSaveData.set(null);
  }

  cancelSave(): void {
    this.isConfirmSaveOpen.set(false);
    this.pendingSaveData.set(null);
  }

  toggleStatus(e: Employee): void {
    this.employeeService.update({ ...e, status: e.status === 'active' ? 'inactive' : 'active' });
  }

  delete(id: number): void { this.deleteTargetId.set(id); }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (id !== null) this.employeeService.delete(id);
    this.deleteTargetId.set(null);
  }

  cancelDelete(): void { this.deleteTargetId.set(null); }
}
