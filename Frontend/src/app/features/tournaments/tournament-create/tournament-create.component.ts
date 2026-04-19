import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TournamentsService } from '@core/services/tournaments.service';
import { ToastService } from '@core/services/toast.service';
import { TournamentFormat } from '@core/models/enums';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent],
  template: `
    <div class="max-w-2xl mx-auto animate-in">
      <div class="mb-4">
        <a routerLink="/tournament" class="text-xs text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour aux tournois
        </a>
      </div>

      <div class="surface p-7">
        <div class="label text-muted mb-2">Nouveau · V1</div>
        <h1 class="mb-1">Créer un tournoi</h1>
        <p class="text-sm text-muted mb-6">
          Créé en statut <span class="pill-draft label px-1.5 py-0.5 rounded">BROUILLON</span>.
          Passez-le en <span class="pill-open label px-1.5 py-0.5 rounded">OUVERT</span> pour accepter les inscriptions.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="field">
            <label class="field-label" for="name">Nom du tournoi</label>
            <input id="name" type="text" formControlName="name" class="input" placeholder="Spring Cup 2026" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="field-label" for="game">Jeu</label>
              <input id="game" type="text" formControlName="game" class="input" />
            </div>
            <div class="field">
              <label class="field-label" for="format">Format</label>
              <select id="format" formControlName="format" class="select">
                <option [value]="BO1">BO1 · Best of 1</option>
                <option [value]="BO3">BO3 · Best of 3</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="field-label" for="deadline">Fin des inscriptions</label>
              <input id="deadline" type="datetime-local" formControlName="registrationDeadline" class="input" />
            </div>
            <div class="field">
              <label class="field-label" for="startsAt">Début</label>
              <input id="startsAt" type="datetime-local" formControlName="startsAt" class="input" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="field">
              <label class="field-label" for="endsAt">Fin <span class="text-muted normal-case">(optionnel)</span></label>
              <input id="endsAt" type="datetime-local" formControlName="endsAt" class="input" />
            </div>
            <div class="field">
              <label class="field-label" for="maxTeams">Nombre max d'équipes</label>
              <input id="maxTeams" type="number" min="2" max="64" formControlName="maxTeams" class="input" />
              <p class="field-hint">Entre 2 et 64.</p>
            </div>
          </div>

          <app-error-message [error]="error()" />

          <div class="flex gap-2 pt-2">
            <button type="submit" [disabled]="form.invalid || loading()" class="btn btn-primary btn-md flex-1">
              {{ loading() ? 'Création…' : 'Créer le tournoi' }}
            </button>
            <a routerLink="/tournament" class="btn btn-ghost btn-md">Annuler</a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TournamentCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tournaments = inject(TournamentsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  readonly BO1 = TournamentFormat.BO1;
  readonly BO3 = TournamentFormat.BO3;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    game: ['League of Legends', [Validators.required]],
    format: [TournamentFormat.BO1, [Validators.required]],
    registrationDeadline: ['', [Validators.required]],
    startsAt: ['', [Validators.required]],
    endsAt: [''],
    maxTeams: [8, [Validators.required, Validators.min(2), Validators.max(64)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      game: raw.game,
      format: raw.format,
      registrationDeadline: new Date(raw.registrationDeadline).toISOString(),
      startsAt: new Date(raw.startsAt).toISOString(),
      endsAt: raw.endsAt ? new Date(raw.endsAt).toISOString() : undefined,
      maxTeams: Number(raw.maxTeams),
    };

    this.tournaments.create(payload).subscribe({
      next: (t) => {
        this.toast.success(`Tournoi "${t.name}" créé`);
        void this.router.navigate(['/tournament', t.id]);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
