import { Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from './sidebar.config';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly currentYear = new Date().getFullYear();
  isOpen = input(false);
  closed = output<void>();

  sidebarClasses = computed(() => [
    'fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col z-50 transition-transform duration-300 ease-in-out',
    this.isOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
  ].join(' '));

  navItems = NAV_ITEMS;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}