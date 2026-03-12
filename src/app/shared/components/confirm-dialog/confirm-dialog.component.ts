import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirm');
  message = input<string>('Are you sure?');
  confirmLabel = input<string>('Delete');
  cancelLabel = input<string>('Cancel');
  confirmVariant = input<'danger' | 'primary' | 'success'>('danger');

  confirmed = output<void>();
  cancelled = output<void>();
}
