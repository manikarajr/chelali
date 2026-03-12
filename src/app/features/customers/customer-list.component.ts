import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { SlidePanelComponent } from '../../shared/components/slide-panel/slide-panel.component';
import { CustomerFormComponent } from './customer-form.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [NgClass, DecimalPipe, SlidePanelComponent, CustomerFormComponent],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent {
  private customerService = inject(CustomerService);

  customers = this.customerService.customers;
  searchQuery = signal('');
  isPanelOpen = signal(false);
  editingCustomer = signal<Customer | null>(null);

  filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.customers();
    return this.customers().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  openAdd(): void {
    this.editingCustomer.set(null);
    this.isPanelOpen.set(true);
  }

  openEdit(customer: Customer): void {
    this.editingCustomer.set(customer);
    this.isPanelOpen.set(true);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.editingCustomer.set(null);
  }

  onSaved(data: Omit<Customer, 'id'> & { id?: number }): void {
    if (data.id !== undefined) {
      this.customerService.update(data as Customer);
    } else {
      const { id: _id, ...rest } = data;
      this.customerService.add(rest);
    }
    this.closePanel();
  }

  delete(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.delete(id);
    }
  }
}
