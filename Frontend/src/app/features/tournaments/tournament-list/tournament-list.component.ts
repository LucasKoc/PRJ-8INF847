import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { TournamentsService } from '@core/services/tournaments.service';
import { Tournament } from '@core/models/entities';
import { TournamentStatus } from '@core/models/enums';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

const STATUS_BADGE: Record<TournamentStatus, string> = {
  [TournamentStatus.DRAFT]: 'bg-muted text-muted-foreground',
  [TournamentStatus.OPEN]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  [TournamentStatus.CLOSED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  [TournamentStatus.CANCELLED]: 'bg-destructive/10 text-destructive',
  [TournamentStatus.COMPLETED]: 'bg-secondary text-secondary-foreground',
};

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ErrorMessageComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Tournois</h1>
      @if (auth.isTO()) {
        <a
          routerLink="/tournaments/new"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nouveau tournoi
        </a>
      }
    </div>

    <div class="flex gap-2 mb-4 flex-wrap">
      @for (f of filters; track f.value) {
        <button
          type="button"
          (click)="selectedFilter.set(f.value)"
          [class.bg-primary]="selectedFilter() === f.value"
          [class.text-primary-foreground]="selectedFilter() === f.value"
          [class.border-input]="selectedFilter() !== f.value"
          class="inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors"
        >
          {{ f.label }}
        </button>
      }
    </div>

    <app-error-message [error]="error()" />

    @if (loading()) {
      <p class="text-muted-foreground">Chargement…</p>
    } @else if (filtered().length === 0) {
      <p class="text-muted-foreground text-center py-12">Aucun tournoi.</p>
    } @else {
      <div class="space-y-3">
        @for (t of filtered(); track t.id) {
          <a
            [routerLink]="['/tournaments', t.id]"
            class="block rounded-lg border border-border bg-card p-5 hover:border-primary transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 class="font-semibold truncate">{{ t.name }}</h3>
                  <span
                    class="inline-block rounded px-2 py-0.5 text-xs font-medium"
                    [class]="badgeClass(t.status)"
                  >
                    {{ t.status }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">
                  {{ t.game }} · {{ t.format }} · max
                  {{ t.maxTeams }} équipes
                </p>
              </div>
              <div class="text-right text-xs text-muted-foreground shrink-0">
                <p>Début : {{ t.startsAt | date: 'dd/MM/yyyy HH:mm' }}</p>
                <p>
                  Inscription avant :
                  {{ t.registrationDeadline | date: 'dd/MM/yyyy' }}
                </p>
              </div>
            </div>
          </a>
        }
      </div>
    }
  `,
})
export class TournamentListComponent implements OnInit {
  private readonly tournamentsService = inject(TournamentsService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly tournaments = signal<Tournament[]>([]);
  readonly error = signal<unknown>(null);

  readonly selectedFilter = signal<TournamentStatus | 'ALL'>('ALL');

  readonly filters: { label: string; value: TournamentStatus | 'ALL' }[] = [
    { label: 'Tous', value: 'ALL' },
    { label: 'Ouverts', value: TournamentStatus.OPEN },
    { label: 'Brouillons', value: TournamentStatus.DRAFT },
    { label: 'Fermés', value: TournamentStatus.CLOSED },
    { label: 'Terminés', value: TournamentStatus.COMPLETED },
  ];

  readonly filtered = computed(() => {
    const f = this.selectedFilter();
    const all = this.tournaments();
    return f === 'ALL' ? all : all.filter((t) => t.status === f);
  });

  ngOnInit(): void {
    this.tournamentsService.list().subscribe({
      next: (data) => {
        this.tournaments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  badgeClass(status: TournamentStatus): string {
    return STATUS_BADGE[status];
  }
}
