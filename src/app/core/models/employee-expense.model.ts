export type EmployeePaymentType = 'salary' | 'advance' | 'allowance';

export interface EmployeeExpense {
  id: number;
  employeeId: number;
  paymentType: EmployeePaymentType;
  amount: number;
  date: string;
  notes: string;
}
