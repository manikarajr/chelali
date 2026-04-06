import { Component, inject, input, output, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmployeeExpense, EmployeePaymentType } from '../../core/models/employee-expense.model';
import { Employee } from '../../core/models/employee.model';

@Component({
  selector: 'app-employee-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-payment-form.component.html',
})
export class EmployeePaymentFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  expense   = input<EmployeeExpense | null>(null);
  employees = input<Employee[]>([]);
  saved     = output<Omit<EmployeeExpense, 'id'> & { id?: number }>();
  cancelled = output<void>();

  paymentTypes = [
    { value: 'salary',    label: 'Salary Payment' },
    { value: 'advance',   label: 'Advance Payment' },
    { value: 'allowance', label: 'Allowance' },
  ];

  form = this.fb.group({
    employeeId:  [null as number | null, Validators.required],
    paymentType: ['salary' as EmployeePaymentType, Validators.required],
    amount:      [0, [Validators.required, Validators.min(1)]],
    date:        [new Date().toISOString().split('T')[0], Validators.required],
    notes:       [''],
  });

  ngOnChanges(): void {
    const e = this.expense();
    if (e) {
      this.form.patchValue({
        employeeId:  e.employeeId,
        paymentType: e.paymentType,
        amount:      e.amount,
        date:        e.date,
        notes:       e.notes,
      });
    } else {
      this.form.reset({
        employeeId:  null,
        paymentType: 'salary',
        amount:      0,
        date:        new Date().toISOString().split('T')[0],
        notes:       '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const e = this.expense();
    this.saved.emit({
      ...(e ? { id: e.id } : {}),
      employeeId:  Number(val.employeeId),
      paymentType: (val.paymentType as EmployeePaymentType) ?? 'salary',
      amount:      val.amount ?? 0,
      date:        val.date ?? '',
      notes:       val.notes ?? '',
    });
    this.form.reset({
      employeeId:  null,
      paymentType: 'salary',
      amount:      0,
      date:        new Date().toISOString().split('T')[0],
      notes:       '',
    });
  }
}
