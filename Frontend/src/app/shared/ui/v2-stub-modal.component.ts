import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-v2-stub-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-abyss/80 backdrop-blur-sm animate-in"
      role="dialog"
      aria-modal="true"
      (click)="handleBackdrop($event)"
    >
      <div class="surface w-full max-w-md p-6" (click)="$event.stopPropagation()">
        <div class="flex items-start gap-4 mb-4">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-md bg-electric/15 border border-electric/30 text-electric shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-5 h-5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="label text-muted mb-1">À venir · V2</div>
            <h2 class="text-lg font-semibold">{{ title() }}</h2>
          </div>
          <button
            type="button"
            class="text-muted hover:text-ink transition-colors"
            (click)="close.emit()"
            aria-label="Fermer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-5 h-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-sm text-muted leading-relaxed mb-6">
          {{ message() }}
        </p>

        <div class="flex justify-end">
          <button type="button" class="btn btn-primary btn-md" (click)="close.emit()">
            Compris
          </button>
        </div>
      </div>
    </div>
  `,
})
export class V2StubModalComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly close = output<void>();

  handleBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }
}
