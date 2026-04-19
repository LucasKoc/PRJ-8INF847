import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TeamsService } from '@core/services/teams.service';
import { ToastService } from '@core/services/toast.service';
import { Team, TeamMember } from '@core/models/entities';
import { LolRole, MemberStatus } from '@core/models/enums';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, ErrorMessageComponent],
  template: `
    @if (loading()) {
      <p class="text-muted-foreground">Chargement…</p>
    } @else if (team()) {
      <div class="flex items-center gap-3 mb-6">
        <a
          routerLink="/teams"
          class="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Équipes
        </a>
      </div>

      <div class="rounded-lg border border-border bg-card p-6 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-semibold">{{ team()!.name }}</h1>
              <span
                class="inline-block rounded bg-secondary px-2 py-0.5 text-sm font-mono font-medium text-secondary-foreground"
              >
                {{ team()!.tag }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground">
              Capitaine :
              <strong>{{ team()!.captain?.username ?? '—' }}</strong>
            </p>
          </div>
          @if (isCaptain()) {
            <button
              type="button"
              (click)="deleteTeam()"
              class="inline-flex items-center justify-center rounded-md border border-destructive/50 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/10"
            >
              Supprimer
            </button>
          }
        </div>

        <div class="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground text-xs">Titulaires actifs</p>
            <p class="font-semibold text-lg">{{ activeStarters() }} / 5</p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Remplaçants</p>
            <p class="font-semibold text-lg">{{ activeSubs() }}</p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Total membres</p>
            <p class="font-semibold text-lg">{{ activeCount() }}</p>
          </div>
        </div>
      </div>

      <!-- Liste des membres -->
      <div class="rounded-lg border border-border bg-card p-6 mb-6">
        <h2 class="font-semibold mb-4">Effectif</h2>
        @if (members().length === 0) {
          <p class="text-sm text-muted-foreground">Aucun membre.</p>
        } @else {
          <ul class="divide-y divide-border">
            @for (m of members(); track m.id) {
              <li class="py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-medium">
                    {{ m.user?.username ?? 'User #' + m.userId }}
                  </span>
                  <span
                    class="inline-block rounded bg-secondary px-2 py-0.5 text-xs"
                  >
                    {{ m.role }}
                  </span>
                  @if (m.isSubstitute) {
                    <span
                      class="inline-block rounded bg-muted px-2 py-0.5 text-xs"
                    >
                      Remplaçant
                    </span>
                  }
                  @if (m.status !== 'ACTIVE') {
                    <span
                      class="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {{ m.status }}
                    </span>
                  }
                  @if (m.userId === team()!.captainUserId) {
                    <span
                      class="inline-block rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                    >
                      Capitaine
                    </span>
                  }
                </div>
                @if (
                  isCaptain() &&
                  m.userId !== team()!.captainUserId &&
                  m.status === 'ACTIVE'
                ) {
                  <button
                    type="button"
                    (click)="removeMember(m.id)"
                    class="text-xs text-destructive hover:underline"
                  >
                    Retirer
                  </button>
                }
              </li>
            }
          </ul>
        }
      </div>

      <!-- Ajouter un membre (capitaine) -->
      @if (isCaptain()) {
        <div class="rounded-lg border border-border bg-card p-6">
          <h2 class="font-semibold mb-4">Ajouter un membre</h2>
          <form
            [formGroup]="addForm"
            (ngSubmit)="addMember()"
            class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end"
          >
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="userId">
                ID utilisateur
              </label>
              <input
                id="userId"
                type="text"
                formControlName="userId"
                placeholder="42"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="memberRole">Rôle</label>
              <select
                id="memberRole"
                formControlName="role"
                class="flex h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                @for (r of lolRoles; track r) {
                  <option [value]="r">{{ r }}</option>
                }
              </select>
            </div>
            <label class="flex items-center gap-2 text-sm whitespace-nowrap h-9">
              <input type="checkbox" formControlName="isSubstitute" />
              Remplaçant
            </label>
            <button
              type="submit"
              [disabled]="addForm.invalid || adding()"
              class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 h-9"
            >
              Ajouter
            </button>
          </form>
          <app-error-message [error]="addError()" />
        </div>
      }
    } @else {
      <app-error-message [error]="error()" />
    }
  `,
})
export class TeamDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teamsService = inject(TeamsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  readonly loading = signal(true);
  readonly team = signal<Team | null>(null);
  readonly members = signal<TeamMember[]>([]);
  readonly error = signal<unknown>(null);
  readonly adding = signal(false);
  readonly addError = signal<unknown>(null);

  readonly lolRoles = Object.values(LolRole);

  readonly isCaptain = computed(() => {
    const t = this.team();
    const user = this.auth.user();
    return !!t && !!user && t.captainUserId === user.id;
  });

  readonly activeCount = computed(
    () => this.members().filter((m) => m.status === MemberStatus.ACTIVE).length,
  );
  readonly activeStarters = computed(
    () =>
      this.members().filter(
        (m) => m.status === MemberStatus.ACTIVE && !m.isSubstitute,
      ).length,
  );
  readonly activeSubs = computed(
    () =>
      this.members().filter(
        (m) => m.status === MemberStatus.ACTIVE && m.isSubstitute,
      ).length,
  );

  readonly addForm = this.fb.nonNullable.group({
    userId: ['', [Validators.required]],
    role: [LolRole.MID, [Validators.required]],
    isSubstitute: [false],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.teamsService.get(this.id()).subscribe({
      next: (team) => {
        this.team.set(team);
        this.members.set(team.members ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  private reloadMembers(): void {
    this.teamsService.listMembers(this.id()).subscribe({
      next: (members) => this.members.set(members),
    });
  }

  addMember(): void {
    if (this.addForm.invalid) return;
    this.adding.set(true);
    this.addError.set(null);

    this.teamsService.addMember(this.id(), this.addForm.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Membre ajouté');
        this.adding.set(false);
        this.addForm.reset({
          userId: '',
          role: LolRole.MID,
          isSubstitute: false,
        });
        this.reloadMembers();
      },
      error: (err) => {
        this.addError.set(err);
        this.adding.set(false);
      },
    });
  }

  removeMember(memberId: string): void {
    if (!confirm('Retirer ce joueur de l\'équipe ?')) return;
    this.teamsService.removeMember(this.id(), memberId).subscribe({
      next: () => {
        this.toast.success('Membre retiré');
        this.reloadMembers();
      },
      error: (err) => this.toast.error(this.parseError(err)),
    });
  }

  deleteTeam(): void {
    if (!confirm('Supprimer cette équipe ? Cette action est irréversible.')) return;
    this.teamsService.remove(this.id()).subscribe({
      next: () => {
        this.toast.success('Équipe supprimée');
        void this.router.navigate(['/teams']);
      },
      error: (err) => this.toast.error(this.parseError(err)),
    });
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
