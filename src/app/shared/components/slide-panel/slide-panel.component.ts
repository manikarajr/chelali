import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-slide-panel',
  standalone: true,
  imports: [NgClass],
  template: `
    <!-- Backdrop: only in DOM when open, preventing phantom clicks from opener buttons -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-40"
        (click)="close()"
      ></div>
    }

    <!-- Panel: always in DOM so the slide transition plays -->
    <div
      class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col z-50
             transform transition-transform duration-300 ease-in-out"
      [ngClass]="isOpen() ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
        <button
          type="button"
          (click)="close()"
          class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class SlidePanelComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
