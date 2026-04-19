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
    <div class="max-w-md mx-auto animate-in">
      <div class="mb-4">
        <a routerLink="/teams" class="text-xs text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour aux équipes
        </a>
      </div>
      <div class="surface p-7">
        <div class="label text-muted mb-2">Nouvelle · V1</div>
        <h1 class="mb-1">Créer une équipe</h1>
        <p class="text-sm text-muted mb-6">Vous en serez le capitaine automatiquement.</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="field">
            <label class="field-label" for="name">Nom de l'équipe</label>
            <input id="name" type="text" formControlName="name" class="input" />
            <p class="field-hint">3 à 80 caractères.</p>
          </div>

          <div class="field">
            <label class="field-label" for="tag">Tag</label>
            <input
              id="tag"
              type="text"
              formControlName="tag"
              maxlength="3"
              class="input tag-mono uppercase tracking-widest"
              placeholder="PHX"
            />
            <p class="field-hint">2 à 3 caractères alphanumériques. Ex : PHX, T1, G2.</p>
          </div>

          <app-error-message [error]="error()" />

          <div class="flex gap-2 pt-2">
            <button type="submit" [disabled]="form.invalid || loading()" class="btn btn-primary btn-md flex-1">
              {{ loading() ? 'Création…' : "Créer l'équipe" }}
            </button>
            <a routerLink="/teams" class="btn btn-ghost btn-md">Annuler</a>
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
