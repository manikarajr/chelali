export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  openingBalance: number;
  status: 'active' | 'inactive';
}
