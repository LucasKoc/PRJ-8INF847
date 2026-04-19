import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';
import { V2StubModalComponent } from '@shared/ui/v2-stub-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent, V2StubModalComponent],
  template: `
    <div class="max-w-md mx-auto py-8 animate-in">
      <div class="surface p-7">
        <div class="label text-muted mb-2">Accès · V1</div>
        <h1 class="mb-1">Se connecter</h1>
        <p class="text-sm text-muted mb-6">
          Accédez à votre compte avec votre nom d'utilisateur ou votre email.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="field">
            <label class="field-label" for="identifier">Identifiant</label>
            <input
              id="identifier"
              type="text"
              formControlName="identifier"
              autocomplete="username"
              placeholder="alice_mid"
              class="input"
            />
          </div>

          <div class="field">
            <div class="flex items-baseline justify-between">
              <label class="field-label" for="password">Mot de passe</label>
              <button
                type="button"
                class="text-xs text-electric hover:text-electric-hover"
                (click)="showForgotModal.set(true)"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="input"
            />
          </div>

          <app-error-message [error]="error()" />

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="btn btn-primary btn-lg w-full"
          >
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full hairline"></span>
          </div>
          <div class="relative flex justify-center">
            <span class="bg-surface px-3 text-xs text-muted uppercase tracking-wider">ou</span>
          </div>
        </div>

        <p class="text-sm text-muted text-center">
          Pas encore de compte ?
          <a routerLink="/signup" class="text-electric hover:text-electric-hover font-medium">
            Créez-en un
          </a>
        </p>
      </div>
    </div>

    @if (showForgotModal()) {
      <app-v2-stub-modal
        title="Réinitialisation du mot de passe"
        message="Cette fonctionnalité sera disponible dans une future version. Pour l'instant, contactez un administrateur si vous avez perdu l'accès à votre compte."
        (close)="showForgotModal.set(false)"
      />
    }
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<unknown>(null);
  readonly showForgotModal = signal(false);

  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: res => {
        this.toast.success(`Bienvenue, ${res.user.username}`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        void this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
