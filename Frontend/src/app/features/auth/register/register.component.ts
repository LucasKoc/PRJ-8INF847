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
    <div class="max-w-md mx-auto py-8 animate-in">
      <div class="surface p-7">
        <div class="label text-muted mb-2">Nouveau compte · V1</div>
        <h1 class="mb-1">Rejoindre DPSCHECK</h1>
        <p class="text-sm text-muted mb-6">Création en 30 secondes.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="field">
            <label class="field-label" for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              class="input"
            />
          </div>

          <div class="field">
            <label class="field-label" for="username">Nom d'utilisateur</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              autocomplete="username"
              class="input"
            />
            <p class="field-hint">Lettres, chiffres, _ et -. 3 à 50 caractères.</p>
          </div>

          <div class="field">
            <label class="field-label" for="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              class="input"
            />
            <p class="field-hint">Minimum 8 caractères.</p>
          </div>

          <!-- Role cards -->
          <div class="field">
            <label class="field-label">Type de compte</label>
            <div class="grid grid-cols-2 gap-2">
              @for (option of roleOptions; track option.value) {
                <label
                  class="cursor-pointer rounded-md p-3 border border-border bg-raised hover:border-ghost transition-colors has-[:checked]:border-electric has-[:checked]:bg-electric/10"
                >
                  <input
                    type="radio"
                    class="sr-only"
                    [value]="option.value"
                    formControlName="role"
                  />
                  <div class="flex items-start gap-2">
                    <span [innerHTML]="option.icon" class="text-electric shrink-0 mt-0.5"></span>
                    <div>
                      <div class="font-semibold text-sm mb-0.5">{{ option.label }}</div>
                      <div class="text-xs text-muted leading-snug">{{ option.hint }}</div>
                    </div>
                  </div>
                </label>
              }
            </div>
          </div>

          <app-error-message [error]="error()" />

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="btn btn-primary btn-lg w-full"
          >
            {{ loading() ? 'Création…' : 'Créer mon compte' }}
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
          Déjà un compte ?
          <a routerLink="/login" class="text-electric hover:text-electric-hover font-medium"
            >Se connecter</a
          >
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
      hint: 'Profil LoL, équipes, inscriptions.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M6 12h12M6 8h12M9 16h6"/></svg>',
    },
    {
      value: UserRole.TO,
      label: 'Organisateur',
      hint: 'Créer et arbitrer des tournois.',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M6 9H4.5a2.5 2.5 0 010-5H6m12 0h1.5a2.5 2.5 0 010 5H18m-12 0v3a6 6 0 0012 0V9"/></svg>',
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
      error: err => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
