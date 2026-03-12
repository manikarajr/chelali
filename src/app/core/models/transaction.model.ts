export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type PaymentMethod = 'cash' | 'bank' | 'online';

export interface Transaction {
  id: number;
  customerId: number;
  date: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
}
