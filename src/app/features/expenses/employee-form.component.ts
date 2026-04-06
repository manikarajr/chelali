import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Employee, EmployeeStatus } from '../../core/models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  employee = input<Employee | null>(null);
  saved = output<Omit<Employee, 'id'> & { id?: number }>();
  cancelled = output<void>();

  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    phone:       [''],
    basicSalary: [0, [Validators.required, Validators.min(1)]],
    status:      ['active' as EmployeeStatus, Validators.required],
  });

  ngOnChanges(): void {
    const e = this.employee();
    if (e) {
      this.form.patchValue({ name: e.name, phone: e.phone ?? '', basicSalary: e.basicSalary, status: e.status });
    } else {
      this.form.reset({ name: '', phone: '', basicSalary: 0, status: 'active' });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const e = this.employee();
    this.saved.emit({
      ...(e ? { id: e.id } : {}),
      name:        val.name ?? '',
      phone:       val.phone || undefined,
      basicSalary: val.basicSalary ?? 0,
      status:      (val.status as EmployeeStatus) ?? 'active',
    });
    this.form.reset({ name: '', phone: '', basicSalary: 0, status: 'active' });
  }
}
