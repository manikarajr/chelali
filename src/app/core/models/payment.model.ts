export interface Payment {
  id: number;
  customerId: number;
  date: string;
  amount: number;
  method: 'cash' | 'bank' | 'online';
  notes: string;
}
