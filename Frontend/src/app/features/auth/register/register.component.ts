import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/enums';
import { ToastService } from '@core/services/toast.service';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent],
  template: `
    <div class="max-w-md mx-auto py-8">
      <div class="rounded-lg border border-border bg-card p-6">
        <h1 class="text-2xl font-semibold mb-1">Créer un compte</h1>
        <p class="text-sm text-muted-foreground mb-6">
          Rejoignez la communauté DPSCHECK.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="username">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              formControlName="username"
              autocomplete="username"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p class="text-xs text-muted-foreground">
              Lettres, chiffres, _ et -. 3 à 50 caractères.
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p class="text-xs text-muted-foreground">Minimum 8 caractères.</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Type de compte</label>
            <div class="grid grid-cols-2 gap-2">
              @for (option of roleOptions; track option.value) {
                <label
                  class="cursor-pointer rounded-md border border-input bg-card p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    class="sr-only"
                    [value]="option.value"
                    formControlName="role"
                  />
                  <div class="font-medium text-sm">{{ option.label }}</div>
                  <div class="text-xs text-muted-foreground mt-0.5">
                    {{ option.hint }}
                  </div>
                </label>
              }
            </div>
          </div>

          <app-error-message [error]="error()" />

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {{ loading() ? 'Création…' : 'Créer mon compte' }}
          </button>
        </form>

        <p class="text-sm text-muted-foreground mt-6 text-center">
          Déjà un compte ?
          <a routerLink="/login" class="font-medium text-primary hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  readonly roleOptions = [
    {
      value: UserRole.PLAYER,
      label: 'Joueur',
      hint: 'Créer un profil, rejoindre une équipe, participer aux tournois.',
    },
    {
      value: UserRole.TO,
      label: 'Organisateur (TO)',
      hint: 'Créer et arbitrer des tournois.',
    },
  ];

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: [UserRole.PLAYER, [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Compte créé avec succès');
        void this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
