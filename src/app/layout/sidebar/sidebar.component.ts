import { Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NAV_ITEMS } from './sidebar.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly currentYear = new Date().getFullYear();
  isOpen = input(false);
  closed = output<void>();

  sidebarClasses = computed(() =>
    'fixed bg-gray-900 text-white flex flex-col z-50 will-change-transform ' +
    // Mobile: bottom bar
    'bottom-0 left-0 right-0 h-16 border-t border-gray-800 ' +
    // Desktop: left sidebar
    'lg:top-0 lg:bottom-0 lg:left-0 lg:right-auto lg:h-full lg:w-64 lg:border-t-0'
  );

  navItems = NAV_ITEMS;
}
