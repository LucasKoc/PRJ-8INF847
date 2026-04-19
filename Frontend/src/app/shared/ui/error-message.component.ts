import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-error-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <div
        role="alert"
        class="flex items-start gap-2.5 rounded-md pill-cancelled px-3 py-2.5 text-sm animate-in"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="w-4 h-4 shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span class="flex-1 leading-relaxed">{{ message() }}</span>
      </div>
    }
  `,
})
export class ErrorMessageComponent {
  readonly error = input<unknown>(null);

  readonly message = computed<string | null>(() => {
    const err = this.error();
    if (!err) return null;

    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object' && 'message' in body) {
        const msg = (body as { message: unknown }).message;
        if (Array.isArray(msg)) return msg.join(' · ');
        return String(msg);
      }
      if (err.status === 0) return 'Impossible de joindre le serveur.';
      return err.message;
    }

    if (err instanceof Error) return err.message;
    return String(err);
  });
}
