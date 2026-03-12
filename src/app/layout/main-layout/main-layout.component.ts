import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  sidebarOpen = signal(false);
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
}
