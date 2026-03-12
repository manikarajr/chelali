import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NAV_ITEMS } from '../sidebar/sidebar.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  navItems = NAV_ITEMS;
}
