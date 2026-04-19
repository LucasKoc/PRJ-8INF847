import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { TeamsService } from '@core/services/teams.service';
import { ToastService } from '@core/services/toast.service';
import { TournamentsService } from '@core/services/tournaments.service';
import { Team, Tournament, TournamentRegistration } from '@core/models/entities';
import { RegistrationStatus, TournamentStatus } from '@core/models/enums';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

// Transitions autorisées (miroir backend)
const ALLOWED_NEXT: Record<TournamentStatus, TournamentStatus[]> = {
  [TournamentStatus.DRAFT]: [TournamentStatus.OPEN, TournamentStatus.CANCELLED],
  [TournamentStatus.OPEN]: [TournamentStatus.CLOSED, TournamentStatus.CANCELLED],
  [TournamentStatus.CLOSED]: [TournamentStatus.COMPLETED],
  [TournamentStatus.CANCELLED]: [],
  [TournamentStatus.COMPLETED]: [],
};

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ReactiveFormsModule, ErrorMessageComponent],
  template: `
    @if (loading()) {
      <p class="text-muted-foreground">Chargement…</p>
    } @else if (tournament()) {
      <div class="mb-4">
        <a
          routerLink="/tournaments"
          class="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Tournois
        </a>
      </div>

      <!-- Header -->
      <div class="rounded-lg border border-border bg-card p-6 mb-6">
        <div class="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div class="min-w-0">
            <div class="flex items-center gap-3 mb-1 flex-wrap">
              <h1 class="text-2xl font-semibold">{{ tournament()!.name }}</h1>
              <span
                class="inline-block rounded px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {{ tournament()!.status }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ tournament()!.game }} · {{ tournament()!.format }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Organisé par
              {{ tournament()!.organizer?.username ?? '—' }}
            </p>
          </div>

          @if (isOrganizer()) {
            <div class="flex gap-2 flex-wrap">
              @for (next of allowedNext(); track next) {
                <button
                  type="button"
                  (click)="changeStatus(next)"
                  class="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  → {{ next }}
                </button>
              }
            </div>
          }
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground text-xs">Début</p>
            <p class="font-medium">
              {{ tournament()!.startsAt | date: 'dd/MM/yyyy HH:mm' }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Fin inscriptions</p>
            <p class="font-medium">
              {{
                tournament()!.registrationDeadline | date: 'dd/MM/yyyy HH:mm'
              }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Max équipes</p>
            <p class="font-medium">{{ tournament()!.maxTeams }}</p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Inscrites</p>
            <p class="font-medium">
              {{ registrations().length }} / {{ tournament()!.maxTeams }}
            </p>
          </div>
        </div>
      </div>

      <!-- Section inscription (capitaine) -->
      @if (
        auth.isPlayer() &&
        tournament()!.status === 'OPEN' &&
        captainTeams().length > 0
      ) {
        <div class="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 class="font-semibold mb-4">Inscrire une de mes équipes</h2>
          <form
            [formGroup]="regForm"
            (ngSubmit)="register()"
            class="flex gap-3 items-end flex-wrap"
          >
            <div class="space-y-1.5 flex-1 min-w-[200px]">
              <label class="text-sm font-medium" for="teamId">Équipe</label>
              <select
                id="teamId"
                formControlName="teamId"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionnez une équipe</option>
                @for (t of captainTeams(); track t.id) {
                  <option [value]="t.id">{{ t.name }} ({{ t.tag }})</option>
                }
              </select>
            </div>
            <button
              type="submit"
              [disabled]="regForm.invalid || registering()"
              class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 h-9"
            >
              {{ registering() ? 'Inscription…' : 'Inscrire' }}
            </button>
          </form>
          <app-error-message [error]="regError()" />
        </div>
      }

      <!-- Liste des inscriptions -->
      <div class="rounded-lg border border-border bg-card p-6">
        <h2 class="font-semibold mb-4">Inscriptions</h2>

        @if (registrations().length === 0) {
          <p class="text-sm text-muted-foreground">
            Aucune inscription pour le moment.
          </p>
        } @else {
          <ul class="divide-y divide-border">
            @for (r of registrations(); track r.id) {
              <li class="py-3 flex items-center justify-between gap-4 flex-wrap">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium">
                      {{ r.team?.name ?? 'Équipe #' + r.teamId }}
                    </span>
                    @if (r.team?.tag) {
                      <span
                        class="inline-block rounded bg-secondary px-1.5 py-0.5 text-xs font-mono"
                      >
                        {{ r.team?.tag }}
                      </span>
                    }
                    <span
                      class="inline-block rounded px-2 py-0.5 text-xs font-medium"
                      [class]="statusBadge(r.status)"
                    >
                      {{ r.status }}
                    </span>
                  </div>
                  @if (r.reviewNote) {
                    <p class="text-xs text-muted-foreground mt-1">
                      Note : {{ r.reviewNote }}
                    </p>
                  }
                </div>

                @if (
                  isOrganizer() && r.status === 'PENDING'
                ) {
                  <div class="flex gap-1">
                    <button
                      type="button"
                      (click)="review(r.id, 'APPROVED')"
                      class="inline-flex items-center rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Approuver
                    </button>
                    <button
                      type="button"
                      (click)="review(r.id, 'REJECTED')"
                      class="inline-flex items-center rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                    >
                      Rejeter
                    </button>
                  </div>
                }

                @if (
                  auth.isPlayer() &&
                  isMyRegistration(r) &&
                  (r.status === 'PENDING' || r.status === 'APPROVED')
                ) {
                  <button
                    type="button"
                    (click)="cancelRegistration(r.id)"
                    class="text-xs text-destructive hover:underline"
                  >
                    Annuler
                  </button>
                }
              </li>
            }
          </ul>
        }
      </div>
    } @else {
      <app-error-message [error]="error()" />
    }
  `,
})
export class TournamentDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly registrationsService = inject(RegistrationsService);
  private readonly teamsService = inject(TeamsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly tournament = signal<Tournament | null>(null);
  readonly registrations = signal<TournamentRegistration[]>([]);
  readonly myTeams = signal<Team[]>([]);
  readonly error = signal<unknown>(null);
  readonly regError = signal<unknown>(null);
  readonly registering = signal(false);

  readonly isOrganizer = computed(() => {
    const t = this.tournament();
    const user = this.auth.user();
    return !!t && !!user && t.organizerUserId === user.id;
  });

  readonly captainTeams = computed(() => {
    const user = this.auth.user();
    if (!user) return [];
    const registeredTeamIds = new Set(this.registrations().map((r) => r.teamId));
    return this.myTeams().filter(
      (t) => t.captainUserId === user.id && !registeredTeamIds.has(t.id),
    );
  });

  readonly allowedNext = computed(() => {
    const t = this.tournament();
    return t ? ALLOWED_NEXT[t.status] : [];
  });

  readonly regForm = this.fb.nonNullable.group({
    teamId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.load();
    if (this.auth.isPlayer()) {
      this.teamsService.list().subscribe({
        next: (teams) => this.myTeams.set(teams),
      });
    }
  }

  private load(): void {
    this.loading.set(true);
    this.tournamentsService.get(this.id()).subscribe({
      next: (t) => {
        this.tournament.set(t);
        this.registrations.set(t.registrations ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  private reloadRegistrations(): void {
    this.registrationsService.list(this.id()).subscribe({
      next: (regs) => this.registrations.set(regs),
    });
  }

  isMyRegistration(r: TournamentRegistration): boolean {
    const user = this.auth.user();
    return !!user && r.team?.captainUserId === user.id;
  }

  changeStatus(next: TournamentStatus): void {
    if (!confirm(`Passer le tournoi en ${next} ?`)) return;
    this.tournamentsService.changeStatus(this.id(), next).subscribe({
      next: (t) => {
        this.tournament.set(t);
        this.toast.success(`Statut mis à jour : ${t.status}`);
      },
      error: (err) => this.toast.error(this.parseError(err)),
    });
  }

  register(): void {
    if (this.regForm.invalid) return;
    this.registering.set(true);
    this.regError.set(null);

    const teamId = this.regForm.getRawValue().teamId;
    this.registrationsService.register(this.id(), teamId).subscribe({
      next: () => {
        this.toast.success('Inscription envoyée (en attente de validation)');
        this.registering.set(false);
        this.regForm.reset({ teamId: '' });
        this.reloadRegistrations();
      },
      error: (err) => {
        this.regError.set(err);
        this.registering.set(false);
      },
    });
  }

  review(regId: string, decision: 'APPROVED' | 'REJECTED'): void {
    const note = decision === 'REJECTED' ? prompt('Motif du rejet (optionnel) :') ?? undefined : undefined;
    this.registrationsService
      .review(regId, {
        status:
          decision === 'APPROVED'
            ? RegistrationStatus.APPROVED
            : RegistrationStatus.REJECTED,
        reviewNote: note,
      })
      .subscribe({
        next: () => {
          this.toast.success(
            decision === 'APPROVED' ? 'Inscription approuvée' : 'Inscription rejetée',
          );
          this.reloadRegistrations();
        },
        error: (err) => this.toast.error(this.parseError(err)),
      });
  }

  cancelRegistration(regId: string): void {
    if (!confirm('Annuler cette inscription ?')) return;
    this.registrationsService.cancel(regId).subscribe({
      next: () => {
        this.toast.success('Inscription annulée');
        this.reloadRegistrations();
      },
      error: (err) => this.toast.error(this.parseError(err)),
    });
  }

  statusBadge(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case RegistrationStatus.REJECTED:
        return 'bg-destructive/10 text-destructive';
      case RegistrationStatus.CANCELLED:
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  }

  private parseError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error: unknown }).error;
      if (body && typeof body === 'object' && 'message' in body) {
        const msg = (body as { message: unknown }).message;
        return Array.isArray(msg) ? msg.join(' · ') : String(msg);
      }
    }
    return 'Une erreur est survenue';
  }
}
