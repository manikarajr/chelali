export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: number;
  name: string;
  phone?: string;
  basicSalary: number;
  status: EmployeeStatus;
}
