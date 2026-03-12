import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-slide-panel',
  standalone: true,
  imports: [NgClass],
  templateUrl: './slide-panel.component.html',
})
export class SlidePanelComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
