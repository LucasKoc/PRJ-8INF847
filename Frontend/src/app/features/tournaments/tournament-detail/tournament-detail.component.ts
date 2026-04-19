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
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { TeamsService } from '@core/services/teams.service';
import { ToastService } from '@core/services/toast.service';
import { TournamentsService } from '@core/services/tournaments.service';
import { Team, Tournament, TournamentRegistration } from '@core/models/entities';
import {
  REG_STATUS_LABEL_FR,
  RegistrationStatus,
  STATUS_LABEL_FR,
  TournamentStatus,
} from '@core/models/enums';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

const ALLOWED_NEXT: Record<TournamentStatus, TournamentStatus[]> = {
  [TournamentStatus.DRAFT]: [TournamentStatus.OPEN, TournamentStatus.CANCELLED],
  [TournamentStatus.OPEN]: [TournamentStatus.CLOSED, TournamentStatus.CANCELLED],
  [TournamentStatus.CLOSED]: [TournamentStatus.COMPLETED],
  [TournamentStatus.CANCELLED]: [],
  [TournamentStatus.COMPLETED]: [],
};

const STATUS_PILL: Record<TournamentStatus, string> = {
  [TournamentStatus.DRAFT]: 'pill-draft',
  [TournamentStatus.OPEN]: 'pill-open',
  [TournamentStatus.CLOSED]: 'pill-closed',
  [TournamentStatus.CANCELLED]: 'pill-cancelled',
  [TournamentStatus.COMPLETED]: 'pill-completed',
};

const REG_PILL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.PENDING]: 'pill-pending',
  [RegistrationStatus.APPROVED]: 'pill-approved',
  [RegistrationStatus.REJECTED]: 'pill-rejected',
  [RegistrationStatus.CANCELLED]: 'pill-cancelled',
};

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ReactiveFormsModule, ErrorMessageComponent],
  template: `
    <div class="animate-in">
      <div class="mb-4">
        <a
          routerLink="/tournament"
          class="text-xs text-muted hover:text-ink transition-colors inline-flex items-center gap-1"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-3 h-3"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour aux tournois
        </a>
      </div>

      @if (loading()) {
        <div class="surface h-48 animate-pulse mb-4"></div>
        <div class="surface h-64 animate-pulse"></div>
      } @else if (tournament()) {
        <!-- ========== HEADER ========== -->
        <div class="surface p-6 mb-4">
          <div class="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2.5 mb-2 flex-wrap">
                <h1 class="display text-3xl">{{ tournament()!.name }}</h1>
                <span
                  class="label px-2 py-1 rounded inline-flex items-center gap-1.5"
                  [class]="statusPill(tournament()!.status)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    [class]="dotClass(tournament()!.status)"
                  ></span>
                  {{ statusLabel(tournament()!.status) }}
                </span>
              </div>
              <p class="text-sm text-muted">
                {{ tournament()!.game }} ·
                <span class="tag-mono text-ink">{{ tournament()!.format }}</span> · Organisé par
                <span class="text-ink">{{ tournament()!.organizer?.username ?? '—' }}</span>
              </p>
            </div>

            @if (isOrganizer() && allowedNext().length > 0) {
              <div class="flex gap-1.5 flex-wrap">
                @for (next of allowedNext(); track next) {
                  <button
                    type="button"
                    (click)="changeStatus(next)"
                    class="btn btn-secondary btn-sm"
                  >
                    → {{ statusLabel(next) }}
                  </button>
                }
              </div>
            }
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <div class="label text-muted mb-1">Début</div>
              <p class="text-sm text-ink tabular-nums">
                {{ tournament()!.startsAt | date: 'dd MMM yyyy' : '' : 'fr-FR' }}
              </p>
              <p class="text-xs text-muted tabular-nums">
                {{ tournament()!.startsAt | date: 'HH:mm' : '' : 'fr-FR' }}
              </p>
            </div>
            <div>
              <div class="label text-muted mb-1">Fin inscriptions</div>
              <p class="text-sm text-ink tabular-nums">
                {{ tournament()!.registrationDeadline | date: 'dd MMM yyyy' : '' : 'fr-FR' }}
              </p>
              <p class="text-xs text-muted tabular-nums">
                {{ tournament()!.registrationDeadline | date: 'HH:mm' : '' : 'fr-FR' }}
              </p>
            </div>
            <div>
              <div class="label text-muted mb-1">Max équipes</div>
              <p class="display-xl text-2xl text-ink tabular-nums">{{ tournament()!.maxTeams }}</p>
            </div>
            <div>
              <div class="label text-muted mb-1">Inscrites</div>
              <p class="display-xl text-2xl text-ink tabular-nums">
                {{ approvedCount()
                }}<span class="text-muted text-base font-normal"
                  >/{{ tournament()!.maxTeams }}</span
                >
              </p>
            </div>
          </div>
        </div>

        <!-- ========== BRACKET V2 PLACEHOLDER ========== -->
        <div class="surface p-6 mb-4 relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-electric/40"></div>
          <div class="flex items-start gap-4">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-md bg-electric/10 border border-electric/30 text-electric shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-5 h-5"
              >
                <path
                  d="M6 3v18M18 3v18M3 6h3M3 12h3M3 18h3M18 6h3M18 12h3M18 18h3M6 8h12M6 16h12"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3>Bracket du tournoi</h3>
                <span
                  class="label text-electric px-1.5 py-0.5 rounded bg-electric/10 border border-electric/30"
                  >À VENIR · V2</span
                >
              </div>
              <p class="text-sm text-muted leading-relaxed">
                Disponible à la clôture des inscriptions. La génération automatique du bracket
                (simple élimination avec byes) et l'affichage en arbre visuel arriveront dans une
                version ultérieure.
              </p>
            </div>
          </div>
        </div>

        <!-- ========== CAPTAIN: register own team ========== -->
        @if (auth.isPlayer() && tournament()!.status === OPEN && captainTeams().length > 0) {
          <div class="surface p-6 mb-4">
            <h2 class="mb-4">Inscrire mon équipe</h2>
            <form
              [formGroup]="regForm"
              (ngSubmit)="register()"
              class="flex gap-3 items-end flex-wrap"
            >
              <div class="field flex-1 min-w-[200px]">
                <label class="field-label" for="teamId">Équipe</label>
                <select id="teamId" formControlName="teamId" class="select">
                  <option value="">Sélectionnez une équipe</option>
                  @for (t of captainTeams(); track t.id) {
                    <option [value]="t.id">{{ t.name }} ({{ t.tag }})</option>
                  }
                </select>
              </div>
              <button
                type="submit"
                [disabled]="regForm.invalid || registering()"
                class="btn btn-primary btn-md"
              >
                {{ registering() ? 'Inscription…' : 'Inscrire' }}
              </button>
            </form>
            <div class="mt-3">
              <app-error-message [error]="regError()" />
            </div>
          </div>
        }

        <!-- ========== REGISTRATIONS ========== -->
        <div class="surface p-6">
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2>Inscriptions</h2>
            <span class="text-xs text-muted tabular-nums"
              >{{ registrations().length }} au total</span
            >
          </div>

          @if (registrations().length === 0) {
            <p class="text-sm text-muted text-center py-6">Aucune inscription pour le moment.</p>
          } @else {
            <ul class="divide-y divide-border -mx-6">
              @for (r of registrations(); track r.id) {
                <li class="px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap mb-0.5">
                      <span class="font-medium text-ink">{{
                        r.team?.name ?? 'Équipe #' + r.teamId
                      }}</span>
                      @if (r.team?.tag) {
                        <span
                          class="tag-mono text-xs bg-raised border border-border px-1.5 py-0.5 rounded"
                          >{{ r.team?.tag }}</span
                        >
                      }
                      <span class="label px-1.5 py-0.5 rounded" [class]="regPill(r.status)">
                        {{ regStatusLabel(r.status) }}
                      </span>
                    </div>
                    @if (r.reviewNote) {
                      <p class="text-xs text-muted mt-1">Note : {{ r.reviewNote }}</p>
                    }
                  </div>

                  <div class="flex items-center gap-1.5 flex-wrap">
                    @if (isOrganizer() && r.status === PENDING) {
                      <button
                        type="button"
                        class="btn btn-sm"
                        style="background:var(--color-go);color:var(--color-abyss);"
                        (click)="review(r.id, APPROVED)"
                      >
                        Approuver
                      </button>
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        (click)="review(r.id, REJECTED)"
                      >
                        Rejeter
                      </button>
                    }
                    @if (
                      auth.isPlayer() &&
                      isMyRegistration(r) &&
                      (r.status === PENDING || r.status === APPROVED)
                    ) {
                      <button
                        type="button"
                        class="btn btn-ghost btn-sm text-alert hover:text-alert hover:bg-alert/10"
                        (click)="cancel(r.id)"
                      >
                        Annuler
                      </button>
                    }
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      } @else {
        <app-error-message [error]="error()" />
      }
    </div>
  `,
})
export class TournamentDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly registrationsService = inject(RegistrationsService);
  private readonly teamsService = inject(TeamsService);
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

  // Expose enum values for template
  readonly OPEN = TournamentStatus.OPEN;
  readonly PENDING = RegistrationStatus.PENDING;
  readonly APPROVED = RegistrationStatus.APPROVED;
  readonly REJECTED = RegistrationStatus.REJECTED;

  readonly isOrganizer = computed(() => {
    const t = this.tournament();
    const u = this.auth.user();
    return !!t && !!u && t.organizerUserId === u.id;
  });

  readonly captainTeams = computed(() => {
    const u = this.auth.user();
    if (!u) return [];
    const registeredIds = new Set(
      this.registrations()
        .filter(
          r => r.status === RegistrationStatus.PENDING || r.status === RegistrationStatus.APPROVED,
        )
        .map(r => String(r.teamId)),
    );
    return this.myTeams().filter(
      t => String(t.captainUserId) === String(u.id) && !registeredIds.has(String(t.id)),
    );
  });

  readonly approvedCount = computed(
    () => this.registrations().filter(r => r.status === RegistrationStatus.APPROVED).length,
  );

  readonly allowedNext = computed(() => {
    const t = this.tournament();
    return t ? ALLOWED_NEXT[t.status] : [];
  });

  readonly regForm = this.fb.nonNullable.group({
    teamId: ['', [Validators.required]],
  });

  statusLabel(s: TournamentStatus): string {
    return STATUS_LABEL_FR[s];
  }
  statusPill(s: TournamentStatus): string {
    return STATUS_PILL[s];
  }
  regStatusLabel(s: RegistrationStatus): string {
    return REG_STATUS_LABEL_FR[s];
  }
  regPill(s: RegistrationStatus): string {
    return REG_PILL[s];
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

  isMyRegistration(r: TournamentRegistration): boolean {
    const u = this.auth.user();
    return !!u && r.team?.captainUserId === u.id;
  }

  ngOnInit(): void {
    this.load();
    this.teamsService.list().subscribe({
      next: teams => this.myTeams.set(teams),
      error: () => this.myTeams.set([]),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.tournamentsService.get(this.id()).subscribe({
      next: t => {
        this.tournament.set(t);
        this.registrations.set(t.registrations ?? []);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  private reloadRegistrations(): void {
    this.registrationsService.list(this.id()).subscribe({
      next: regs => this.registrations.set(regs),
    });
  }

  changeStatus(next: TournamentStatus): void {
    if (!confirm(`Passer le tournoi en ${STATUS_LABEL_FR[next]} ?`)) return;
    this.tournamentsService.changeStatus(this.id(), next).subscribe({
      next: t => {
        this.tournament.set(t);
        this.toast.success(`Statut mis à jour : ${STATUS_LABEL_FR[t.status]}`);
      },
      error: err => this.toast.error(this.parseErr(err)),
    });
  }

  register(): void {
    if (this.regForm.invalid) return;
    this.registering.set(true);
    this.regError.set(null);

    const teamId = this.regForm.getRawValue().teamId;
    this.registrationsService.register(this.id(), teamId).subscribe({
      next: () => {
        this.toast.success('Inscription envoyée · en attente de validation');
        this.registering.set(false);
        this.regForm.reset({ teamId: '' });
        this.reloadRegistrations();
      },
      error: err => {
        this.regError.set(err);
        this.registering.set(false);
      },
    });
  }

  review(regId: string, decision: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED): void {
    const note =
      decision === RegistrationStatus.REJECTED
        ? (prompt('Motif du rejet (optionnel) :') ?? undefined)
        : undefined;
    this.registrationsService.review(regId, { status: decision, reviewNote: note }).subscribe({
      next: () => {
        this.toast.success(
          decision === RegistrationStatus.APPROVED
            ? 'Inscription approuvée'
            : 'Inscription rejetée',
        );
        this.reloadRegistrations();
      },
      error: err => this.toast.error(this.parseErr(err)),
    });
  }

  cancel(regId: string): void {
    if (!confirm('Annuler cette inscription ?')) return;
    this.registrationsService.cancel(regId).subscribe({
      next: () => {
        this.toast.success('Inscription annulée');
        this.reloadRegistrations();
      },
      error: err => this.toast.error(this.parseErr(err)),
    });
  }

  private parseErr(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object' && 'message' in body) {
        const m = (body as { message: unknown }).message;
        return Array.isArray(m) ? m.join(' · ') : String(m);
      }
    }
    return 'Une erreur est survenue';
  }
}
