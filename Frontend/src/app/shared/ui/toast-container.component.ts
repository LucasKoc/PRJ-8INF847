import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastVariant } from '@core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none"
    >
      @for (t of toast.toasts(); track t.id) {
        <div
          class="surface px-4 py-3 text-sm flex items-start gap-3 animate-in pointer-events-auto relative overflow-hidden"
        >
          <span class="absolute left-0 top-0 bottom-0 w-0.5" [class]="accent(t.variant)"></span>
          <span class="shrink-0 mt-0.5" [class]="iconColor(t.variant)">
            @switch (t.variant) {
              @case ('success') {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  class="w-4 h-4"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              }
              @case ('error') {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              }
              @default {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              }
            }
          </span>
          <p class="flex-1 pl-1">{{ t.message }}</p>
          <button
            type="button"
            class="text-muted hover:text-ink transition-colors shrink-0"
            (click)="toast.dismiss(t.id)"
            aria-label="Fermer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-3.5 h-3.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toast = inject(ToastService);

  accent(v: ToastVariant): string {
    switch (v) {
      case 'success':
        return 'bg-go';
      case 'error':
        return 'bg-alert';
      default:
        return 'bg-electric';
    }
  }

  iconColor(v: ToastVariant): string {
    switch (v) {
      case 'success':
        return 'text-go';
      case 'error':
        return 'text-alert';
      default:
        return 'text-electric';
    }
  }
}
