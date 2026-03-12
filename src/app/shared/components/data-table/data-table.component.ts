import { Component, input, output, signal, computed, contentChild, TemplateRef } from '@angular/core';
import { NgClass, DecimalPipe, CurrencyPipe, DatePipe, TitleCasePipe, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'status' | 'actions' | 'index';
  className?: string;
  headerClassName?: string;
  hiddenMd?: boolean;
  hiddenSm?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgClass, DecimalPipe, CurrencyPipe, DatePipe, TitleCasePipe, NgTemplateOutlet, FormsModule],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  pageSize = input<number>(5);
  searchPlaceholder = input<string>('Search...');
  noDataMessage = input<string>('No data found.');

  actionTemplate = contentChild<TemplateRef<any>>('actions');
  statusTemplate = contentChild<TemplateRef<any>>('status');
  customCellTemplate = contentChild<TemplateRef<any>>('customCell');

  searchQuery = signal('');
  currentPage = signal(1);

  filteredData = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const allData = this.data();
    if (!q) return allData;

    return allData.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(q)
      );
    });
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredData().length / this.pageSize()) || 1;
  });

  paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredData().slice(start, end);
  });

  startIndex = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredData().length));

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  setPage(page: number): void {
    this.currentPage.set(page);
  }
}
