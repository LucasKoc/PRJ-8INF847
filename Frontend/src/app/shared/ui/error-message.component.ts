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
        class="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {{ message() }}
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
        return Array.isArray(msg) ? msg.join(' · ') : String(msg);
      }
      return err.message;
    }
    if (err instanceof Error) return err.message;
    return String(err);
  });
}
