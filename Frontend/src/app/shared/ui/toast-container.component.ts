import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
        class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      @for (item of toastService.toasts(); track item.id) {
        <div
            class="rounded-md border shadow-lg px-4 py-3 text-sm bg-card text-card-foreground"
            [class.border-green-500]="item.variant === 'success'"
            [class.border-destructive]="item.variant === 'error'"
            [class.border-border]="item.variant === 'info'"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="flex-1">{{ item.message }}</p>
            <button
                type="button"
                class="text-muted-foreground hover:text-foreground"
                (click)="toastService.dismiss(item.id)"
                aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
