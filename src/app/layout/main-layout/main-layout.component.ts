import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NAV_ITEMS } from '../sidebar/sidebar.config';

const BOTTOM_ROUTES = ['/customers', '/transactions', '/invoices'];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);
  hamburgerOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  toggleHamburger() { this.hamburgerOpen.update(v => !v); }
  closeHamburger() { this.hamburgerOpen.set(false); }

  bottomNavItems = NAV_ITEMS.filter(i => BOTTOM_ROUTES.includes(i.route));
  hamburgerNavItems = NAV_ITEMS.filter(i => !BOTTOM_ROUTES.includes(i.route));
}
