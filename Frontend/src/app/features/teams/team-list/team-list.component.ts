import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TeamsService } from '@core/services/teams.service';
import { Team } from '@core/models/entities';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ErrorMessageComponent],
  template: `
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Équipes</h1>
      @if (auth.isPlayer()) {
        <a
          routerLink="/teams/new"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nouvelle équipe
        </a>
      }
    </div>

    <app-error-message [error]="error()" />

    @if (loading()) {
      <p class="text-muted-foreground">Chargement…</p>
    } @else if (teams().length === 0) {
      <p class="text-muted-foreground text-center py-12">
        Aucune équipe pour le moment.
      </p>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (team of teams(); track team.id) {
          <a
            [routerLink]="['/teams', team.id]"
            class="block rounded-lg border border-border bg-card p-5 hover:border-primary transition-colors"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold truncate">{{ team.name }}</h3>
              <span
                class="inline-block rounded bg-secondary px-2 py-0.5 text-xs font-mono font-medium text-secondary-foreground"
              >
                {{ team.tag }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground">
              Capitaine : {{ team.captain?.username ?? '—' }}
            </p>
            <p class="text-xs text-muted-foreground mt-2">
              {{ team.members?.length ?? 0 }} membre(s)
            </p>
          </a>
        }
      </div>
    }
  `,
})
export class TeamListComponent implements OnInit {
  private readonly teamsService = inject(TeamsService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly teams = signal<Team[]>([]);
  readonly error = signal<unknown>(null);

  ngOnInit(): void {
    this.teamsService.list().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }
}
