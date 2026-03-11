export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  outstandingAmount: number;
}
