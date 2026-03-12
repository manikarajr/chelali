import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NAV_ITEMS } from '../sidebar/sidebar.config';
import { AuthService } from '../../core/services/auth.service';

const BOTTOM_ROUTES = ['/dashboard', '/customers', '/transactions', '/invoices'];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  hamburgerOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  toggleHamburger() { this.hamburgerOpen.update(v => !v); }
  closeHamburger() { this.hamburgerOpen.set(false); }

  bottomNavItems = NAV_ITEMS.filter(i => BOTTOM_ROUTES.includes(i.route));
  hamburgerNavItems = NAV_ITEMS.filter(i => !BOTTOM_ROUTES.includes(i.route));

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
