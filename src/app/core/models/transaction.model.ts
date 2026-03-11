export interface Transaction {
  id: number;
  customerId: number;
  date: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
}
