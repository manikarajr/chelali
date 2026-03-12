import { Component, input, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Invoice } from '../../core/models/invoice.model';
import { Customer } from '../../core/models/customer.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DataTableComponent],
  templateUrl: './invoice-view.component.html',
})
export class InvoiceViewComponent {
  invoice = input<Invoice | null>(null);
  customer = input<Customer | null>(null);

  transactionColumns: TableColumn[] = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'description', label: 'Description' },
    { key: 'quantity', label: 'Qty', className: 'text-right' },
    { key: 'totalAmount', label: 'Amount', type: 'currency', className: 'text-right' },
    { key: 'paidAmount', label: 'Paid', type: 'currency', className: 'text-right' },
  ];

  transactionTableData = computed(() => {
    const inv = this.invoice();
    if (!inv?.transactions) return [];
    return inv.transactions.map(t => ({ ...t, description: 'Ice Purchase' }));
  });

  whatsappLink(): string {
    const inv = this.invoice();
    const cust = this.customer();
    if (!inv || !cust) return '#';
    const phone = cust.phone.replace(/\D/g, '');
    const startFmt = new Date(inv.startDate).toLocaleDateString('en-IN');
    const endFmt = new Date(inv.endDate).toLocaleDateString('en-IN');
    const msg = `Hello ${cust.name},\n\nInvoice for ice purchases from ${startFmt} to ${endFmt}.\n\nInvoice No: ${inv.invoiceNumber}\nPrevious Outstanding: ₹${inv.previousOutstanding.toLocaleString('en-IN')}\nCurrent Purchases: ₹${inv.currentPurchases.toLocaleString('en-IN')}\nPayments Received: ₹${inv.paymentsReceived.toLocaleString('en-IN')}\nTotal Balance: ₹${inv.totalOutstanding.toLocaleString('en-IN')}\n\nThank you.`;
    return `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
  }

  generatePDF(): void {
    const inv = this.invoice();
    const cust = this.customer();
    if (!inv) return;

    // ── Helpers ───────────────────────────────────────────────────────────
    const rs = (n: number) => `Rs. ${n.toLocaleString('en-IN')}`;
    const fmtDate = (d: string | Date) =>
      new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

    // ── Design tokens (Tailwind-inspired palette) ─────────────────────────
    const C = {
      white:       [255, 255, 255] as const,
      slate50:     [248, 250, 252] as const,
      slate100:    [241, 245, 249] as const,
      slate200:    [226, 232, 240] as const,
      slate400:    [148, 163, 184] as const,
      slate500:    [100, 116, 139] as const,
      slate700:    [51,  65,  85]  as const,
      slate900:    [15,  23,  42]  as const,
      indigo600:   [79,  70,  229] as const,
      indigo50:    [238, 242, 255] as const,
      green500:    [34,  197, 94]  as const,
      green50:     [240, 253, 244] as const,
    };

    const PW = 210, PH = 297, ML = 18, MR = 18;
    const CW = PW - ML - MR;
    let y = 0;

    // Tiny wrappers so callers stay readable
    const fill = (...rgb: readonly [number, number, number]) => pdf.setFillColor(...rgb);
    const pen  = (...rgb: readonly [number, number, number]) => pdf.setDrawColor(...rgb);
    const ink  = (...rgb: readonly [number, number, number]) => pdf.setTextColor(...rgb);
    const fnt  = (style: 'normal' | 'bold', sz: number) => {
      pdf.setFont('helvetica', style);
      pdf.setFontSize(sz);
    };

    // ── 1. Header ─────────────────────────────────────────────────────────
    // Full-width white header — clean, no heavy dark band
    y = 14;

    // Company name (left)
    fnt('bold', 18);
    ink(...C.slate900);
    pdf.text('Chelali Ice Plant', ML, y);

    // Invoice label + number (right)
    fnt('normal', 8);
    ink(...C.slate400);
    pdf.text('INVOICE', PW - MR, y - 4, { align: 'right' });

    fnt('bold', 10);
    ink(...C.indigo600);
    pdf.text(inv.invoiceNumber, PW - MR, y + 1, { align: 'right' });

    y += 4;

    // Thin indigo rule under header
    fill(...C.indigo600);
    pdf.rect(ML, y + 4, CW, 0.5, 'F');
    y += 12;

    // ── 2. Meta row (issued date + billing period) ────────────────────────
    fnt('normal', 8);
    ink(...C.slate500);
    pdf.text(`Issued: ${fmtDate(inv.generatedDate)}`, ML, y);
    pdf.text(
      `Billing period: ${fmtDate(inv.startDate)} – ${fmtDate(inv.endDate)}`,
      PW - MR, y, { align: 'right' }
    );
    y += 12;

    // ── 3. Bill-to / Amount-due cards ─────────────────────────────────────
    const cardH = 36;
    const halfW  = (CW - 6) / 2;   // 6 mm gutter
    const rightX = ML + halfW + 6;

    // Bill-to card (slate-50 bg)
    fill(...C.slate50);
    pdf.roundedRect(ML, y, halfW, cardH, 2, 2, 'F');
    pen(...C.slate200); pdf.setLineWidth(0.25);
    pdf.roundedRect(ML, y, halfW, cardH, 2, 2, 'S');

    fnt('normal', 7);
    ink(...C.slate400);
    pdf.text('BILLED TO', ML + 5, y + 8);

    fnt('bold', 11);
    ink(...C.slate900);
    pdf.text(cust?.name ?? '—', ML + 5, y + 16);

    if (cust?.address) {
      fnt('normal', 7.5);
      ink(...C.slate500);
      const lines = pdf.splitTextToSize(cust.address, halfW - 10);
      pdf.text(lines, ML + 5, y + 22);
    }

    if (cust?.phone) {
      fnt('normal', 7.5);
      ink(...C.indigo600);
      pdf.text(`Tel: ${cust.phone}`, ML + 5, y + 31);
    }

    // Amount-due card (indigo tinted bg)
    fill(...C.indigo50);
    pdf.roundedRect(rightX, y, halfW, cardH, 2, 2, 'F');
    pen(...C.indigo600); pdf.setLineWidth(0.25);
    pdf.roundedRect(rightX, y, halfW, cardH, 2, 2, 'S');

    fnt('normal', 7);
    ink(...C.slate400);
    pdf.text('AMOUNT DUE', rightX + 5, y + 8);

    fnt('bold', 16);
    ink(...C.indigo600);
    pdf.text(rs(inv.totalOutstanding), rightX + 5, y + 20);

    fnt('normal', 7);
    ink(...C.slate500);
    pdf.text('Please settle before next billing cycle.', rightX + 5, y + 30);

    y += cardH + 12;

    // ── 4. Transactions table ─────────────────────────────────────────────
    fnt('bold', 10);
    ink(...C.slate900);
    pdf.text('Transactions', ML, y);

    const txCount = (inv.transactions ?? []).length;
    fnt('normal', 7.5);
    ink(...C.slate400);
    pdf.text(`${txCount} item${txCount !== 1 ? 's' : ''}`, PW - MR, y, { align: 'right' });

    y += 6;

    // Column layout: Date(28) Desc(60) Qty(20) Amount(32) Paid(32) = 172 (CW=174 w/ padding)
    const cols = {
      date: { x: ML,       w: 28, align: 'left'  as const },
      desc: { x: ML + 28,  w: 62, align: 'left'  as const },
      qty:  { x: ML + 90,  w: 24, align: 'right' as const },
      amt:  { x: ML + 114, w: 32, align: 'right' as const },
      paid: { x: ML + 146, w: 28, align: 'right' as const },
    };

    const thH  = 8;
    const rowH = 8.5;

    const drawHeader = (hy: number) => {
      fill(...C.slate900);
      pdf.rect(ML, hy, CW, thH, 'F');

      fnt('bold', 6.5);
      ink(...C.slate400);

      const headers: [keyof typeof cols, string][] = [
        ['date', 'DATE'], ['desc', 'DESCRIPTION'],
        ['qty', 'QTY'], ['amt', 'AMOUNT'], ['paid', 'PAID'],
      ];

      headers.forEach(([key, label]) => {
        const c = cols[key];
        const tx = c.align === 'right' ? c.x + c.w - 3 : c.x + 3;
        pdf.text(label, tx, hy + 5.5, { align: c.align });
      });
    };

    drawHeader(y);
    y += thH;

    let pageTableStart = y;
    const transactions = inv.transactions ?? [];

    if (transactions.length === 0) {
      fill(...C.white);
      pdf.rect(ML, y, CW, rowH * 2, 'F');
      fnt('normal', 9);
      ink(...C.slate400);
      pdf.text('No transactions in this period.', PW / 2, y + rowH, { align: 'center' });
      y += rowH * 2;
    } else {
      transactions.forEach((t, i) => {
        // Page break
        if (y + rowH > PH - 60) {
          // Close table on current page
          pen(...C.slate200); pdf.setLineWidth(0.25);
          pdf.rect(ML, pageTableStart - thH, CW, y - pageTableStart + thH, 'S');

          pdf.addPage();
          y = 15;
          drawHeader(y);
          y += thH;
          pageTableStart = y;
        }

        // Alternating row background
        i % 2 === 0 ? fill(...C.white) : fill(...C.slate50);
        pdf.rect(ML, y, CW, rowH, 'F');

        // Subtle row separator
        pen(...C.slate100); pdf.setLineWidth(0.2);
        pdf.line(ML, y + rowH, ML + CW, y + rowH);

        // Row content
        fnt('normal', 8); ink(...C.slate700);
        pdf.text(fmtDate(t.date), cols.date.x + 3, y + 5.5);

        fnt('normal', 8); ink(...C.slate700);
        pdf.text('Ice Purchase', cols.desc.x + 3, y + 5.5);

        fnt('normal', 8); ink(...C.slate500);
        pdf.text(`${t.quantity} kg`, cols.qty.x + cols.qty.w - 3, y + 5.5, { align: 'right' });

        fnt('bold', 8); ink(...C.slate900);
        pdf.text(rs(t.totalAmount), cols.amt.x + cols.amt.w - 3, y + 5.5, { align: 'right' });

        fnt('bold', 8); ink(...C.green500);
        pdf.text(rs(t.paidAmount), cols.paid.x + cols.paid.w - 3, y + 5.5, { align: 'right' });

        y += rowH;
      });
    }

    // Table outer border
    pen(...C.slate200); pdf.setLineWidth(0.25);
    pdf.rect(ML, pageTableStart - thH, CW, y - pageTableStart + thH, 'S');
    y += 10;

    // ── 5. Summary block ──────────────────────────────────────────────────
    const sumW  = 90;
    const sumX  = PW - MR - sumW;
    const sRowH = 9;

    const summaryRows = [
      { label: 'Previous Outstanding', value: rs(inv.previousOutstanding), bold: false },
      { label: 'Current Purchases (+)', value: rs(inv.currentPurchases),   bold: false },
      { label: 'Payments Received (−)', value: rs(inv.paymentsReceived),   bold: false, green: true },
    ];

    const sumStartY = y;

    summaryRows.forEach((row, i) => {
      fill(...C.white);
      pdf.rect(sumX, y, sumW, sRowH, 'F');

      fnt('normal', 8);
      ink(...C.slate500);
      pdf.text(row.label, sumX + 5, y + 6);

      fnt('bold', 8);
      row.green ? ink(...C.green500) : ink(...C.slate700);
      pdf.text(row.value, sumX + sumW - 5, y + 6, { align: 'right' });

      // Divider (skip last)
      if (i < summaryRows.length - 1) {
        pen(...C.slate100); pdf.setLineWidth(0.2);
        pdf.line(sumX, y + sRowH, sumX + sumW, y + sRowH);
      }

      y += sRowH;
    });

    // Grand total row
    const gtH = 12;
    fill(...C.slate900);
    pdf.rect(sumX, y, sumW, gtH, 'F');

    fnt('bold', 7.5);
    ink(...C.slate400);
    pdf.text('GRAND TOTAL', sumX + 5, y + 7.5);

    fnt('bold', 12);
    ink(...C.white);
    pdf.text(rs(inv.totalOutstanding), sumX + sumW - 5, y + 8.5, { align: 'right' });

    // Summary border
    pen(...C.slate200); pdf.setLineWidth(0.25);
    pdf.rect(sumX, sumStartY, sumW, summaryRows.length * sRowH + gtH, 'S');

    y += gtH;

    // Paid-in-full badge
    if (inv.totalOutstanding === 0) {
      y += 5;
      fill(...C.green50);
      pdf.roundedRect(sumX, y, sumW, 9, 2, 2, 'F');
      pen(...C.green500); pdf.setLineWidth(0.3);
      pdf.roundedRect(sumX, y, sumW, 9, 2, 2, 'S');
      fnt('bold', 8.5);
      ink(...C.green500);
      pdf.text('✓  PAID IN FULL', sumX + sumW / 2, y + 6, { align: 'center' });
    }

    // ── 6. Footer ─────────────────────────────────────────────────────────
    const ftY = 282;

    // Top rule
    pen(...C.slate200); pdf.setLineWidth(0.25);
    pdf.line(ML, ftY, PW - MR, ftY);

    fnt('bold', 8);
    ink(...C.slate700);
    pdf.text('Chelali Ice Plant', ML, ftY + 6);

    fnt('normal', 7);
    ink(...C.slate400);
    pdf.text('Thank you for your continued business.', ML, ftY + 11);

    fnt('normal', 7);
    ink(...C.slate400);
    pdf.text(inv.invoiceNumber, PW - MR, ftY + 6, { align: 'right' });

    fnt('normal', 7);
    ink(...C.slate400);
    pdf.text(`Generated ${fmtDate(inv.generatedDate)}`, PW - MR, ftY + 11, { align: 'right' });

    // Indigo accent bar at very bottom
    fill(...C.indigo600);
    pdf.rect(ML, PH - 5, CW, 1.5, 'F');

    pdf.save(`${inv.invoiceNumber}.pdf`);
  }
}