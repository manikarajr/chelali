import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { TransactionService } from '../../core/services/transaction.service';
import { ExpenseService } from '../../core/services/expense.service';
import { CustomerService } from '../../core/services/customer.service';
import ExcelJS from 'exceljs';

type ReportTab = 'sales' | 'expenses' | 'outstanding' | 'profit';

// ── Palette ──────────────────────────────────────────────────────────────────
// Header : deep navy bg   │ white bold text
// Body   : alternating white / pale blue-grey
// Totals : medium blue bg │ white bold text
const COLOR = {
  HEADER_BG:  '1B3A6B',  // deep navy
  HEADER_FG:  'FFFFFF',  // white
  TOTALS_BG:  '2E5FA3',  // medium blue
  TOTALS_FG:  'FFFFFF',  // white
  ROW_ALT:    'EEF3FA',  // pale blue-grey (odd body rows)
  ROW_BASE:   'FFFFFF',  // white (even body rows)
  BORDER:     'C5D3E8',  // soft blue-grey border
  LABEL_FG:   '1B3A6B',  // navy for P&L label column
  PROFIT_FG:  '1A6B3A',  // dark green
  LOSS_FG:    'B71C1C',  // dark red
} as const;

const INR = '"₹"#,##0';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [NgClass, CurrencyPipe, TitleCasePipe, FormsModule, DataTableComponent],
  templateUrl: './reports.component.html',
})
export class ReportsComponent {
  private txService = inject(TransactionService);
  private expenseService = inject(ExpenseService);
  private customerService = inject(CustomerService);

  activeTab = signal<ReportTab>('sales');
  filterType = 'monthly';
  selectedMonth = new Date().toISOString().slice(0, 7);
  selectedYear = new Date().getFullYear();
  dateFrom = '';
  dateTo = '';

  tabs = [
    { value: 'sales' as ReportTab, label: 'Sales Summary', shortLabel: 'Sales' },
    { value: 'expenses' as ReportTab, label: 'Expense Summary', shortLabel: 'Expenses' },
    { value: 'outstanding' as ReportTab, label: 'Outstanding', shortLabel: 'Due' },
    { value: 'profit' as ReportTab, label: 'Profit / Loss', shortLabel: 'P&L' },
  ];

  salesColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'customerName', label: 'Customer', type: 'text' },
    { key: 'quantity', label: 'Qty (kg)', type: 'number', className: 'text-right' },
    { key: 'totalAmount', label: 'Total', type: 'currency', className: 'text-right' },
    { key: 'paidAmount', label: 'Collected', type: 'currency', className: 'text-right text-green-600' },
    { key: 'paymentStatus', label: 'Status', type: 'status', className: 'text-center' },
  ];

  expenseColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'category', label: 'Category', type: 'status' },
    { key: 'amount', label: 'Amount', type: 'currency', className: 'text-right font-semibold' },
    { key: 'notes', label: 'Notes', type: 'text', className: 'max-w-xs truncate text-gray-500' },
  ];

  outstandingColumns: TableColumn[] = [
    { key: 'name', label: 'Customer', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text', className: 'text-gray-500' },
    { key: 'totalBilled', label: 'Total Billed', type: 'currency', className: 'text-right text-gray-700' },
    { key: 'paid', label: 'Paid', type: 'currency', className: 'text-right text-green-600' },
    { key: 'outstanding', label: 'Outstanding', type: 'currency', className: 'text-right font-bold' },
  ];

  private inRange(dateStr: string): boolean {
    const d = new Date(dateStr);
    if (this.filterType === 'monthly') {
      const [y, m] = this.selectedMonth.split('-').map(Number);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    }
    if (this.filterType === 'annual') {
      return d.getFullYear() === Number(this.selectedYear);
    }
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to = this.dateTo ? new Date(this.dateTo) : null;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }

  filteredTransactions = computed(() =>
    this.txService.transactions().filter(t => this.inRange(t.date))
  );

  mappedSales = computed(() =>
    this.filteredTransactions().map(t => ({
      ...t,
      customerName: this.customerName(t.customerId)
    }))
  );

  filteredExpenseItems = computed(() =>
    this.expenseService.expenses().filter(e => this.inRange(e.date))
  );

  filteredSales = computed(() =>
    this.filteredTransactions().reduce((s, t) => s + t.totalAmount, 0)
  );

  filteredExpenses = computed(() =>
    this.filteredExpenseItems().reduce((s, e) => s + e.amount, 0)
  );

  totalOutstanding = computed(() =>
    this.txService.transactions().reduce((s, t) => s + t.outstandingAmount, 0)
  );

  netProfit = computed(() => this.filteredSales() - this.filteredExpenses());

  customerOutstanding = computed(() =>
    this.customerService.customers()
      .map(c => {
        const txs = this.txService.transactions().filter(t => t.customerId === c.id);
        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          totalBilled: txs.reduce((s, t) => s + t.totalAmount, 0),
          paid: txs.reduce((s, t) => s + t.paidAmount, 0),
          outstanding: txs.reduce((s, t) => s + t.outstandingAmount, 0),
        };
      })
      .filter(r => r.outstanding > 0)
  );

  customerName(id: number): string {
    return this.customerService.getById(id)?.name ?? 'Unknown';
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private periodLabel(): string {
    if (this.filterType === 'monthly') {
      const [y, m] = this.selectedMonth.split('-');
      const date = new Date(Number(y), Number(m) - 1, 1);
      return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }
    if (this.filterType === 'annual') {
      return String(this.selectedYear);
    }
    return `${this.dateFrom || 'Start'} to ${this.dateTo || 'End'}`;
  }

  // ── Style primitives ───────────────────────────────────────────────────────

  private fill(hex: string): ExcelJS.Fill {
    return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex } };
  }

  private thinBorder(): Partial<ExcelJS.Borders> {
    const s: ExcelJS.BorderStyle = 'thin';
    const c = { argb: 'FF' + COLOR.BORDER };
    return { top: { style: s, color: c }, bottom: { style: s, color: c }, left: { style: s, color: c }, right: { style: s, color: c } };
  }

  // ── Row stylers ────────────────────────────────────────────────────────────

  /** Navy bg, white bold text, centred */
  private applyHeader(row: ExcelJS.Row): void {
    row.height = 22;
    row.eachCell(cell => {
      cell.fill = this.fill(COLOR.HEADER_BG);
      cell.font = { bold: true, color: { argb: 'FF' + COLOR.HEADER_FG }, size: 10, name: 'Arial' };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = this.thinBorder();
    });
  }

  /** Alternating white / pale-blue; currency cols right-aligned with ₹ format.
   *  @param cellFontColor  optional fn(1-indexed col, value) → hex color string or null
   */
  private applyBody(
    row: ExcelJS.Row,
    isAlt: boolean,
    currencyCols: number[],
    cellFontColor?: (col: number, value: string | number | null) => string | null,
  ): void {
    row.height = 18;
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const isCurr = currencyCols.includes(col);
      cell.fill = this.fill(isAlt ? COLOR.ROW_ALT : COLOR.ROW_BASE);
      cell.alignment = { vertical: 'middle', horizontal: isCurr ? 'right' : 'left' };
      cell.border = this.thinBorder();
      if (isCurr && typeof cell.value === 'number') cell.numFmt = INR;

      const overrideColor = cellFontColor?.(col, cell.value as string | number | null);
      cell.font = {
        size: 10,
        name: 'Arial',
        bold: !!overrideColor,
        color: overrideColor ? { argb: 'FF' + overrideColor } : undefined,
      };
    });
  }

  /** Medium-blue bg, white bold text; currency cols right-aligned with ₹ format */
  private applyTotals(row: ExcelJS.Row, currencyCols: number[]): void {
    row.height = 20;
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const isCurr = currencyCols.includes(col);
      cell.fill = this.fill(COLOR.TOTALS_BG);
      cell.font = { bold: true, color: { argb: 'FF' + COLOR.TOTALS_FG }, size: 10, name: 'Arial' };
      cell.alignment = { vertical: 'middle', horizontal: isCurr ? 'right' : 'left' };
      cell.border = this.thinBorder();
      if (isCurr && typeof cell.value === 'number') cell.numFmt = INR;
    });
  }

  // ── Generic data-sheet builder ─────────────────────────────────────────────

  /**
   * Writes headers + data rows + a totals row, then styles all three zones.
   * @param currencyCols  1-indexed column numbers containing ₹ amounts
   * @param sumCols       1-indexed columns to auto-sum in the totals row
   * @param totalsLabel   Text label for the totals row (default 'TOTAL')
   * @param totalsLabelCol  Which 1-indexed column to place the label in (default 1)
   */
  private buildSheet(
    ws: ExcelJS.Worksheet,
    headers: string[],
    rows: (string | number | null)[][],
    colWidths: number[],
    currencyCols: number[],
    sumCols: number[],
    totalsLabel = 'TOTAL',
    totalsLabelCol = 1,
    cellFontColor?: (col: number, value: string | number | null) => string | null,
  ): void {
    ws.columns = colWidths.map(w => ({ width: w }));

    // ① Header
    this.applyHeader(ws.addRow(headers));

    // ② Body rows (alternating stripe starting at row index 0 = white)
    rows.forEach((r, i) => this.applyBody(ws.addRow(r), i % 2 === 1, currencyCols, cellFontColor));

    // ③ Totals row
    const totals: (string | number | null)[] = new Array(headers.length).fill(null);
    totals[totalsLabelCol - 1] = totalsLabel;
    sumCols.forEach(c => {
      totals[c - 1] = rows.reduce((s, r) => s + ((r[c - 1] as number) ?? 0), 0);
    });
    this.applyTotals(ws.addRow(totals), currencyCols);

    // Freeze header, enable auto-filter
    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }];
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  }

  // ── exportExcel ────────────────────────────────────────────────────────────

  async exportExcel(): Promise<void> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'IcePlant';
    wb.created = new Date();
    const period = this.periodLabel();

    // ── Sheet 1 & 5: Sales / Detailed Sales ──────────────────────────────────
    const salesRows = this.mappedSales().map(t => [
      this.formatDate(t.date),
      t.customerName,
      t.quantity,
      t.totalAmount,
      t.paidAmount,
      t.outstandingAmount,
      t.paymentStatus.charAt(0).toUpperCase() + t.paymentStatus.slice(1),
    ] as (string | number)[]);

    const salesHeaders  = ['Date', 'Customer', 'Qty (kg)', 'Total (₹)', 'Collected (₹)', 'Outstanding (₹)', 'Status'];
    const salesWidths   = [14, 24, 10, 16, 16, 18, 11];
    const salesCurrCols = [4, 5, 6];
    const salesSumCols  = [3, 4, 5, 6];

    // Status column (col 7): green = Paid, red = Unpaid, amber = Partial
    const STATUS_COL = 7;
    const statusFontColor = (col: number, value: string | number | null): string | null => {
      if (col !== STATUS_COL) return null;
      switch ((value as string)?.toLowerCase()) {
        case 'paid':    return '1A6B3A'; // dark green
        case 'unpaid':  return 'B71C1C'; // dark red
        case 'partial': return 'B45309'; // amber
        default:        return null;
      }
    };

    this.buildSheet(wb.addWorksheet('Sales Summary'),  salesHeaders, salesRows, salesWidths, salesCurrCols, salesSumCols, 'TOTAL', 1, statusFontColor);
    this.buildSheet(wb.addWorksheet('Detailed Sales'), salesHeaders, salesRows, salesWidths, salesCurrCols, salesSumCols, 'TOTAL', 1, statusFontColor);

    // ── Sheet 2: Expense Summary ──────────────────────────────────────────────
    this.buildSheet(
      wb.addWorksheet('Expense Summary'),
      ['Date', 'Category', 'Description', 'Amount (₹)'],
      this.filteredExpenseItems().map(e => [
        this.formatDate(e.date),
        e.category.charAt(0).toUpperCase() + e.category.slice(1),
        e.notes || '—',
        e.amount,
      ]),
      [14, 18, 40, 16],
      [4], [4], 'TOTAL', 3,
    );

    // ── Sheet 3: Outstanding Balances ─────────────────────────────────────────
    this.buildSheet(
      wb.addWorksheet('Outstanding'),
      ['Customer', 'Phone', 'Total Billed (₹)', 'Paid (₹)', 'Outstanding (₹)'],
      this.customerOutstanding().map(c => [c.name, c.phone, c.totalBilled, c.paid, c.outstanding]),
      [24, 16, 18, 14, 18],
      [3, 4, 5], [3, 4, 5],
    );

    // ── Sheet 4: Profit & Loss (custom layout) ────────────────────────────────
    const wsPL = wb.addWorksheet('Profit & Loss');
    wsPL.columns = [{ width: 34 }, { width: 20 }];

    // Header row
    this.applyHeader(wsPL.addRow(['Metric', 'Amount (₹)']));
    wsPL.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }];

    const profit = this.netProfit();

    type PLEntry =
      | { kind: 'sep' }
      | { kind: 'info';   label: string; value: string }
      | { kind: 'metric'; label: string; value: number; isSummary?: boolean; isProfit?: boolean };

    const plEntries: PLEntry[] = [
      { kind: 'info',   label: 'Report Period',         value: period },
      { kind: 'sep' },
      { kind: 'metric', label: 'Revenue (Sales)',        value: this.filteredSales() },
      { kind: 'metric', label: 'Total Expenses',         value: this.filteredExpenses() },
      { kind: 'sep' },
      { kind: 'metric', label: 'Net Profit / Loss',      value: profit, isSummary: true, isProfit: true },
      { kind: 'sep' },
      { kind: 'metric', label: 'Outstanding (all time)', value: this.totalOutstanding() },
    ];

    for (const entry of plEntries) {
      if (entry.kind === 'sep') {
        // Thin spacer row
        const r = wsPL.addRow(['', '']);
        r.height = 6;
        r.eachCell(c => {
          c.fill = this.fill(COLOR.ROW_BASE);
          c.border = { bottom: { style: 'thin', color: { argb: 'FF' + COLOR.BORDER } } };
        });
        continue;
      }

      const isSummary = entry.kind === 'metric' && !!entry.isSummary;
      const row = wsPL.addRow([entry.label, entry.value]);
      row.height = isSummary ? 22 : 18;

      const labelCell = row.getCell(1);
      const valueCell = row.getCell(2);

      // ── Label cell ──
      labelCell.fill    = this.fill(isSummary ? COLOR.TOTALS_BG : COLOR.ROW_ALT);
      labelCell.font    = {
        bold:  isSummary,
        color: { argb: isSummary ? 'FF' + COLOR.TOTALS_FG : 'FF' + COLOR.LABEL_FG },
        size:  10, name: 'Arial',
      };
      labelCell.alignment = { vertical: 'middle', horizontal: 'left' };
      labelCell.border    = this.thinBorder();

      // ── Value cell ──
      valueCell.fill      = this.fill(isSummary ? COLOR.TOTALS_BG : COLOR.ROW_BASE);
      valueCell.alignment = { vertical: 'middle', horizontal: 'right' };
      valueCell.border    = this.thinBorder();

      if (entry.kind === 'metric') {
        valueCell.numFmt = INR;
        let fgHex = isSummary ? COLOR.TOTALS_FG : '000000';
        if (entry.isProfit) fgHex = profit >= 0 ? COLOR.PROFIT_FG : COLOR.LOSS_FG;
        valueCell.font = {
          bold:  isSummary,
          color: { argb: 'FF' + fgHex },
          size:  isSummary ? 12 : 10,
          name:  'Arial',
        };
      } else {
        // Info row (period label)
        valueCell.font = { italic: true, size: 10, name: 'Arial' };
      }
    }

    // ── Download ───────────────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `IcePlant_Report_${period.replace(/\s+/g, '_')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}