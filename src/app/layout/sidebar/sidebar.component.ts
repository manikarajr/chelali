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
    'fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col z-50 ' +
    'transition-transform duration-300 ease-in-out ' +
    (this.isOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
  );

  navItems = NAV_ITEMS;
}
