import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen bg-gray-50">
      <app-sidebar [isOpen]="sidebarOpen()" (closed)="sidebarOpen.set(false)"></app-sidebar>
      <div class="flex flex-col flex-1 min-h-screen lg:ml-64">
        <app-header (sidebarToggled)="toggleSidebar()"></app-header>
        <main class="flex-1 mt-16 overflow-y-auto p-4 lg:p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
}
