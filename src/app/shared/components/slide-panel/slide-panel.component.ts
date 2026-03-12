import { Component, input, output, signal, AfterViewInit } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-slide-panel',
  standalone: true,
  imports: [NgClass],
  templateUrl: './slide-panel.component.html',
})
export class SlidePanelComponent implements AfterViewInit {
  isOpen = input<boolean>(false);
  title = input<string>('');
  closed = output<void>();

  /** Prevents CSS transition from firing on initial render (avoids open-then-close flash) */
  isReady = signal(false);

  ngAfterViewInit(): void {
    // Small RAF delay ensures the initial translate-x-full is already painted
    // before we allow the transition class, preventing the panel from briefly
    // appearing open on page load.
    requestAnimationFrame(() => this.isReady.set(true));
  }

  close(): void {
    this.closed.emit();
  }
}
