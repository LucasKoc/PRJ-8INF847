import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TournamentsService } from '@core/services/tournaments.service';
import { ToastService } from '@core/services/toast.service';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-tournament-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ErrorMessageComponent],
  template: `
    <div class="max-w-2xl mx-auto py-6">
      <div class="rounded-lg border border-border bg-card p-6">
        <h1 class="text-2xl font-semibold mb-1">Nouveau tournoi</h1>
        <p class="text-sm text-muted-foreground mb-6">
          Le tournoi sera créé en statut <strong>DRAFT</strong>. Vous pourrez le
          passer en <strong>OPEN</strong> pour recevoir les inscriptions.
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium" for="name">Nom</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="game">Jeu</label>
              <input
                id="game"
                type="text"
                formControlName="game"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="format">Format</label>
              <input
                id="format"
                type="text"
                formControlName="format"
                placeholder="Single Elimination BO1"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="deadline">
                Fin des inscriptions
              </label>
              <input
                id="deadline"
                type="datetime-local"
                formControlName="registrationDeadline"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="startsAt">Début</label>
              <input
                id="startsAt"
                type="datetime-local"
                formControlName="startsAt"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="endsAt">
                Fin (optionnel)
              </label>
              <input
                id="endsAt"
                type="datetime-local"
                formControlName="endsAt"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="maxTeams">
                Nombre max d'équipes
              </label>
              <input
                id="maxTeams"
                type="number"
                min="2"
                formControlName="maxTeams"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
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
              routerLink="/tournaments"
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
export class TournamentCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tournaments = inject(TournamentsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<unknown>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    game: ['League of Legends', [Validators.required]],
    format: ['Single Elimination BO1', [Validators.required]],
    registrationDeadline: ['', [Validators.required]],
    startsAt: ['', [Validators.required]],
    endsAt: [''],
    maxTeams: [8, [Validators.required, Validators.min(2)]],
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
        void this.router.navigate(['/tournaments', t.id]);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
