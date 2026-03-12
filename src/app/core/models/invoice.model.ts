export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  startDate: string;
  endDate: string;
  generatedDate: string;
  previousOutstanding: number;
  currentPurchases: number;
  paymentsReceived: number;
  totalOutstanding: number;
  transactions?: any[];
}
