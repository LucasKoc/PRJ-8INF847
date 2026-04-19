import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
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
    <div class="animate-in">
      <div class="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <div class="label text-muted mb-2">Roster · V1</div>
          <h1>Équipes</h1>
          <p class="text-sm text-muted mt-1 tabular-nums">
            {{ teams().length }} équipe<span>{{ teams().length > 1 ? 's' : '' }}</span> dans la communauté
          </p>
        </div>
        @if (auth.isPlayer()) {
          <a routerLink="/teams/new" class="btn btn-primary btn-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>
            Nouvelle équipe
          </a>
        }
      </div>

      <app-error-message [error]="error()" />

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (_ of [1, 2, 3]; track $index) {
            <div class="surface h-32 animate-pulse"></div>
          }
        </div>
      } @else if (teams().length === 0) {
        <div class="surface py-16 text-center">
          <p class="text-muted">Aucune équipe pour le moment.</p>
          @if (auth.isPlayer()) {
            <p class="text-xs text-muted mt-2">Soyez le premier à en créer une.</p>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (team of teams(); track team.id) {
            <a
              [routerLink]="['/teams', team.id]"
              class="surface p-5 block hover:border-electric/60 transition-colors group"
            >
              <div class="flex items-start justify-between mb-4">
                <h3 class="font-semibold truncate pr-2 group-hover:text-electric transition-colors">
                  {{ team.name }}
                </h3>
                <span class="tag-mono text-electric bg-electric/10 border border-electric/30 px-2 py-0.5 rounded shrink-0">
                  {{ team.tag }}
                </span>
              </div>

              <div class="flex items-center gap-2 text-xs text-muted mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>
                <span class="truncate">{{ team.captain?.username ?? '—' }}</span>
              </div>

              <div class="pt-3 border-t border-border flex items-center justify-between">
                <span class="text-xs text-muted tabular-nums">
                  {{ team.members?.length ?? 0 }} membre<span>{{ (team.members?.length ?? 0) > 1 ? 's' : '' }}</span>
                </span>
                <span class="text-xs text-muted group-hover:text-electric transition-colors">Voir →</span>
              </div>
            </a>
          }
        </div>
      }
    </div>
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
      next: (teams) => { this.teams.set(teams); this.loading.set(false); },
      error: (err) => { this.error.set(err); this.loading.set(false); },
    });
  }
}
