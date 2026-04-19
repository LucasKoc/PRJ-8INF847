import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TeamsService } from '@core/services/teams.service';
import { ToastService } from '@core/services/toast.service';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-team-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent],
  template: `
    <div class="max-w-md mx-auto py-6">
      <div class="rounded-lg border border-border bg-card p-6">
        <h1 class="text-2xl font-semibold mb-1">Nouvelle équipe</h1>
        <p class="text-sm text-muted-foreground mb-6">
          Vous en serez automatiquement le capitaine.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="name">Nom de l'équipe</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p class="text-xs text-muted-foreground">3 à 80 caractères.</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="tag">Tag</label>
            <input
              id="tag"
              type="text"
              formControlName="tag"
              maxlength="3"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm font-mono uppercase shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p class="text-xs text-muted-foreground">
              2 à 3 caractères alphanumériques (ex: PHX, T1, G2).
            </p>
          </div>

          <app-error-message [error]="error()" />

          <div class="flex gap-2">
            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {{ loading() ? 'Création…' : 'Créer' }}
            </button>
            <a
              routerLink="/teams"
              class="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Annuler
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TeamCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly teams = inject(TeamsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    tag: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{2,3}$/)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.teams.create(this.form.getRawValue()).subscribe({
      next: (team) => {
        this.toast.success(`Équipe "${team.name}" créée`);
        void this.router.navigate(['/teams', team.id]);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
