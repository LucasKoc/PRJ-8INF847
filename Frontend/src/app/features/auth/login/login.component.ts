import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent],
  template: `
    <div class="max-w-md mx-auto py-8">
      <div class="rounded-lg border border-border bg-card p-6">
        <h1 class="text-2xl font-semibold mb-1">Connexion</h1>
        <p class="text-sm text-muted-foreground mb-6">
          Connectez-vous avec votre email ou votre nom d'utilisateur.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="identifier">
              Email ou nom d'utilisateur
            </label>
            <input
              id="identifier"
              type="text"
              formControlName="identifier"
              autocomplete="username"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <app-error-message [error]="error()" />

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>

        <p class="text-sm text-muted-foreground mt-6 text-center">
          Pas encore de compte ?
          <a routerLink="/register" class="font-medium text-primary hover:underline">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
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

  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Connexion réussie');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
