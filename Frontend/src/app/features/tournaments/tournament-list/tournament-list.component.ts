import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TournamentsService } from '@core/services/tournaments.service';
import { Tournament } from '@core/models/entities';
import { STATUS_LABEL_FR, TournamentStatus } from '@core/models/enums';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

const PILL_CLASS: Record<TournamentStatus, string> = {
  [TournamentStatus.DRAFT]: 'pill-draft',
  [TournamentStatus.OPEN]: 'pill-open',
  [TournamentStatus.CLOSED]: 'pill-closed',
  [TournamentStatus.CANCELLED]: 'pill-cancelled',
  [TournamentStatus.COMPLETED]: 'pill-completed',
};

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ErrorMessageComponent],
  template: `
    <div class="animate-in">
      <div class="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <div class="label text-muted mb-2">Compétitions · V1</div>
          <h1>Tournois</h1>
          <p class="text-sm text-muted mt-1 tabular-nums">
            {{ tournaments().length }} tournoi<span>{{ tournaments().length > 1 ? 's' : '' }}</span>
          </p>
        </div>
        @if (auth.isTO()) {
          <a routerLink="/tournament/new" class="btn btn-primary btn-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              class="w-4 h-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nouveau tournoi
          </a>
        }
      </div>

      <!-- Filters -->
      <div class="flex gap-1.5 mb-5 flex-wrap">
        @for (f of filters; track f.value) {
          <button
            type="button"
            (click)="selectedFilter.set(f.value)"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors border"
            [class.border-electric]="selectedFilter() === f.value"
            [class.bg-electric]="selectedFilter() === f.value"
            [class.text-abyss]="selectedFilter() === f.value"
            [class.border-border]="selectedFilter() !== f.value"
            [class.text-muted]="selectedFilter() !== f.value"
            [class.hover:text-ink]="selectedFilter() !== f.value"
            [class.hover:border-ghost]="selectedFilter() !== f.value"
          >
            {{ f.label }}
            <span class="tabular-nums opacity-70 ml-1">{{ countFor(f.value) }}</span>
          </button>
        }
      </div>

      <app-error-message [error]="error()" />

      @if (loading()) {
        <div class="space-y-2">
          @for (_ of [1, 2, 3]; track $index) {
            <div class="surface h-20 animate-pulse"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="surface py-16 text-center">
          <p class="text-muted">Aucun tournoi dans cette catégorie.</p>
        </div>
      } @else {
        <div class="space-y-2">
          @for (t of filtered(); track t.id) {
            <a
              [routerLink]="['/tournament', t.id]"
              class="surface px-5 py-4 block hover:border-electric/60 transition-colors group"
            >
              <div class="flex items-start justify-between gap-4 flex-wrap">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 class="font-semibold truncate group-hover:text-electric transition-colors">
                      {{ t.name }}
                    </h3>
                    <span
                      class="label px-2 py-0.5 rounded inline-flex items-center gap-1.5"
                      [class]="pillClass(t.status)"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass(t.status)"></span>
                      {{ statusLabel(t.status) }}
                    </span>
                  </div>
                  <p class="text-xs text-muted">
                    {{ t.game }} · <span class="tag-mono text-ink">{{ t.format }}</span> · max
                    <span class="tabular-nums text-ink">{{ t.maxTeams }}</span> équipes
                  </p>
                </div>

                <div class="text-right text-xs text-muted shrink-0 tabular-nums">
                  <div class="flex items-center gap-1.5 justify-end text-ink">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="w-3 h-3 text-muted"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {{ t.startsAt | date: 'dd MMM · HH:mm' : '' : 'fr-FR' }}
                  </div>
                  <div class="text-[11px] mt-0.5 opacity-80">
                    Inscr. avant {{ t.registrationDeadline | date: 'dd/MM' : '' : 'fr-FR' }}
                  </div>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class TournamentListComponent implements OnInit {
  private readonly service = inject(TournamentsService);
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
    return f === 'ALL' ? this.tournaments() : this.tournaments().filter(t => t.status === f);
  });

  ngOnInit(): void {
    this.service.list().subscribe({
      next: data => {
        this.tournaments.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  countFor(value: TournamentStatus | 'ALL'): number {
    return value === 'ALL'
      ? this.tournaments().length
      : this.tournaments().filter(t => t.status === value).length;
  }

  statusLabel(s: TournamentStatus): string {
    return STATUS_LABEL_FR[s];
  }
  pillClass(s: TournamentStatus): string {
    return PILL_CLASS[s];
  }
  dotClass(s: TournamentStatus): string {
    switch (s) {
      case TournamentStatus.OPEN:
        return 'bg-go';
      case TournamentStatus.CLOSED:
        return 'bg-electric';
      case TournamentStatus.CANCELLED:
        return 'bg-alert';
      default:
        return 'bg-muted';
    }
  }
}
