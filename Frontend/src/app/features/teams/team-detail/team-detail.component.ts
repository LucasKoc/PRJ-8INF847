import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { TeamsService } from '@core/services/teams.service';
import { UsersService } from '@core/services/users.service';
import { ToastService } from '@core/services/toast.service';
import { Team, TeamMember, PublicUser } from '@core/models/entities';
import { LolRole, LOL_ROLE_LABEL, MemberStatus } from '@core/models/enums';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, ErrorMessageComponent],
  template: `
    <div class="animate-in">
      <div class="mb-4">
        <a routerLink="/teams" class="text-xs text-muted hover:text-ink transition-colors inline-flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour aux équipes
        </a>
      </div>

      @if (loading()) {
        <div class="surface h-48 animate-pulse mb-4"></div>
        <div class="surface h-64 animate-pulse"></div>
      } @else if (team()) {

        <!-- ========== HEADER ========== -->
        <div class="surface p-6 mb-4">
          <div class="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-3 mb-2 flex-wrap">
                <h1 class="display text-3xl">{{ team()!.name }}</h1>
                <span class="tag-mono text-electric bg-electric/10 border border-electric/30 px-2.5 py-1 rounded">
                  {{ team()!.tag }}
                </span>
              </div>
              <p class="text-sm text-muted">
                Capitaine ·
                <span class="text-ink font-medium">{{ team()!.captain?.username ?? '—' }}</span>
                <span class="pill-captain label px-1.5 py-0.5 rounded ml-1.5">CAPITAINE</span>
              </p>
            </div>
            @if (isCaptain()) {
              <button type="button" class="btn btn-danger btn-sm" (click)="deleteTeam()">
                Supprimer l'équipe
              </button>
            }
          </div>

          <div class="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <div class="label text-muted mb-1">Titulaires</div>
              <p class="display-xl text-2xl tabular-nums"
                 [class.text-go]="activeStarters() >= 5"
                 [class.text-alert]="activeStarters() < 5">
                {{ activeStarters() }}<span class="text-muted text-base font-normal">/5</span>
              </p>
            </div>
            <div>
              <div class="label text-muted mb-1">Remplaçants</div>
              <p class="display-xl text-2xl tabular-nums text-ink">{{ activeSubs() }}</p>
            </div>
            <div>
              <div class="label text-muted mb-1">Total</div>
              <p class="display-xl text-2xl tabular-nums text-ink">{{ activeCount() }}</p>
            </div>
          </div>
        </div>

        <!-- ========== ROSTER ========== -->
        <div class="surface p-6 mb-4">
          <h2 class="mb-4">Effectif actif</h2>
          @if (members().length === 0) {
            <p class="text-sm text-muted">Aucun membre actif.</p>
          } @else {
            <ul class="divide-y divide-border -mx-6">
              @for (m of members(); track m.id) {
                <li class="px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="flex items-center justify-center w-8 h-8 rounded-md bg-electric/15 text-electric text-xs font-bold shrink-0">
                      {{ userInitial(m) }}
                    </span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-medium text-ink">{{ m.user?.username ?? 'User #' + m.userId }}</span>
                        @if (m.userId === team()!.captainUserId) {
                          <span class="pill-captain label px-1.5 py-0.5 rounded">CAP</span>
                        }
                      </div>
                      <div class="flex items-center gap-2 mt-0.5 text-xs text-muted">
                        <span>{{ roleLabel(m.role) }}</span>
                        @if (m.isSubstitute) {
                          <span class="px-1.5 py-0.5 rounded bg-raised border border-border">Remplaçant</span>
                        }
                      </div>
                    </div>
                  </div>
                  @if (isCaptain() && m.userId !== team()!.captainUserId) {
                    <button
                      type="button"
                      class="btn btn-ghost btn-sm text-alert hover:text-alert hover:bg-alert/10"
                      (click)="removeMember(m.id)"
                    >
                      Retirer
                    </button>
                  }
                </li>
              }
            </ul>
          }
        </div>

        <!-- ========== ADD MEMBER (captain only) ========== -->
        @if (isCaptain()) {
          <div class="surface p-6">
            <h2 class="mb-1">Ajouter un membre</h2>
            <p class="text-xs text-muted mb-4">
              Tapez un nom d'utilisateur pour rechercher. Seuls les comptes PLAYER peuvent rejoindre une équipe.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">

              <!-- Username search with autocomplete dropdown -->
              <div class="field relative">
                <label class="field-label" for="userSearch">Nom d'utilisateur</label>
                <div class="relative">
                  <input
                    id="userSearch"
                    type="text"
                    autocomplete="off"
                    placeholder="Rechercher alice_mid…"
                    class="input pr-10"
                    [class.border-electric]="selectedUser() !== null"
                    [value]="searchQuery()"
                    (input)="onSearchInput($event)"
                    (blur)="onSearchBlur()"
                  />
                  @if (selectedUser()) {
                    <!-- Checkmark when a user is selected -->
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-go pointer-events-none">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </span>
                  } @else if (searching()) {
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none animate-spin">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                    </span>
                  }
                </div>

                <!-- Dropdown results -->
                @if (showDropdown()) {
                  @if (searchResults().length > 0) {
                    <ul class="absolute z-30 left-0 right-0 top-full mt-1 surface shadow-lg max-h-52 overflow-y-auto rounded-md">
                      @for (u of searchResults(); track u.id) {
                        <li>
                          <button
                            type="button"
                            class="w-full text-left px-3 py-2.5 text-sm hover:bg-raised transition-colors flex items-center justify-between gap-3"
                            (mousedown)="selectUser(u)"
                          >
                            <div class="flex items-center gap-2">
                              <span class="flex items-center justify-center w-6 h-6 rounded bg-electric/15 text-electric text-xs font-bold">
                                {{ u.username.charAt(0).toUpperCase() }}
                              </span>
                              <span class="font-medium text-ink">{{ u.username }}</span>
                            </div>
                            <span class="tag-mono text-xs text-muted">ID {{ u.id }}</span>
                          </button>
                        </li>
                      }
                    </ul>
                  } @else if (searchQuery().length >= 2 && !searching()) {
                    <div class="absolute z-30 left-0 right-0 top-full mt-1 surface px-3 py-2.5 text-sm text-muted rounded-md">
                      Aucun utilisateur trouvé pour « {{ searchQuery() }} »
                    </div>
                  }
                }
              </div>

              <!-- Role select -->
              <div class="field">
                <label class="field-label" for="addRole">Rôle</label>
                <select id="addRole" [formControl]="addForm.controls.role" class="select w-32">
                  @for (r of lolRoles; track r) {
                    <option [value]="r">{{ roleLabel(r) }}</option>
                  }
                </select>
              </div>

              <!-- Substitute checkbox -->
              <label class="flex items-center gap-2 text-sm h-10 whitespace-nowrap cursor-pointer">
                <input type="checkbox" [formControl]="addForm.controls.isSubstitute" class="accent-electric" />
                Remplaçant
              </label>

              <!-- Submit button -->
              <button
                type="button"
                [disabled]="!selectedUser() || adding()"
                class="btn btn-primary btn-md"
                (click)="addMember()"
              >
                {{ adding() ? 'Ajout…' : 'Ajouter' }}
              </button>
            </div>

            @if (selectedUser()) {
              <p class="text-xs text-muted mt-2">
                Sélectionné : <span class="text-ink font-medium">{{ selectedUser()!.username }}</span>
                <span class="tag-mono ml-1 text-ghost">ID {{ selectedUser()!.id }}</span>
              </p>
            }

            <div class="mt-3">
              <app-error-message [error]="addError()" />
            </div>
          </div>
        }

      } @else {
        <app-error-message [error]="error()" />
      }
    </div>
  `,
})
export class TeamDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teamsService = inject(TeamsService);
  private readonly usersService = inject(UsersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly id = input.required<string>();

  // Page state
  readonly loading = signal(true);
  readonly team = signal<Team | null>(null);
  readonly members = signal<TeamMember[]>([]);
  readonly error = signal<unknown>(null);

  // Add-member state
  readonly adding = signal(false);
  readonly addError = signal<unknown>(null);

  // Search state
  readonly searchQuery = signal('');
  readonly searchResults = signal<PublicUser[]>([]);
  readonly selectedUser = signal<PublicUser | null>(null);
  readonly showDropdown = signal(false);
  readonly searching = signal(false);

  private readonly searchSubject = new Subject<string>();

  readonly lolRoles = Object.values(LolRole);

  readonly isCaptain = computed(() => {
    const t = this.team();
    const u = this.auth.user();
    return !!t && !!u && t.captainUserId === u.id;
  });

  readonly activeCount = computed(() =>
      this.members().filter((m) => m.status === MemberStatus.ACTIVE).length,
  );
  readonly activeStarters = computed(() =>
      this.members().filter((m) => m.status === MemberStatus.ACTIVE && !m.isSubstitute).length,
  );
  readonly activeSubs = computed(() =>
      this.members().filter((m) => m.status === MemberStatus.ACTIVE && m.isSubstitute).length,
  );

  readonly addForm = this.fb.nonNullable.group({
    role: [LolRole.MID],
    isSubstitute: [false],
  });

  roleLabel(r: LolRole): string { return LOL_ROLE_LABEL[r]; }
  userInitial(m: TeamMember): string {
    return (m.user?.username ?? '?').charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    this.load();

    // Debounced search pipeline
    this.searchSubject
        .pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((q) => {
              if (q.length < 2) {
                this.searchResults.set([]);
                this.searching.set(false);
                return [];
              }
              this.searching.set(true);
              return this.usersService.search(q, 8);
            }),
        )
        .subscribe({
          next: (results) => {
            this.searchResults.set(results as PublicUser[]);
            this.searching.set(false);
          },
          error: () => {
            this.searchResults.set([]);
            this.searching.set(false);
          },
        });
  }

  // ---- Search handlers ----

  onSearchInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.searchQuery.set(q);
    this.selectedUser.set(null);
    this.showDropdown.set(true);
    this.searchSubject.next(q);
  }

  onSearchBlur(): void {
    // Small delay so mousedown on a result item fires before the dropdown is hidden
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  selectUser(user: PublicUser): void {
    this.selectedUser.set(user);
    this.searchQuery.set(user.username);
    this.showDropdown.set(false);
    this.searchResults.set([]);
  }

  // ---- Member actions ----

  addMember(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.adding.set(true);
    this.addError.set(null);

    const raw = this.addForm.getRawValue();

    // user.id is the numeric bigint string from the API — safe to send as userId
    this.teamsService.addMember(this.id(), {
      userId: user.id,
      role: raw.role,
      isSubstitute: raw.isSubstitute,
    }).subscribe({
      next: () => {
        this.toast.success(`${user.username} ajouté à l'équipe`);
        this.adding.set(false);
        this.selectedUser.set(null);
        this.searchQuery.set('');
        this.addForm.reset({ role: LolRole.MID, isSubstitute: false });
        this.reloadMembers();
      },
      error: (err) => {
        this.addError.set(err);
        this.adding.set(false);
      },
    });
  }

  removeMember(memberId: string): void {
    if (!confirm("Retirer ce joueur de l'équipe ?")) return;
    this.teamsService.removeMember(this.id(), memberId).subscribe({
      next: () => {
        this.toast.success('Membre retiré');
        this.reloadMembers();
      },
      error: (err) => this.toast.error(this.parseErr(err)),
    });
  }

  deleteTeam(): void {
    if (!confirm('Supprimer cette équipe ? Cette action est irréversible.')) return;
    this.teamsService.remove(this.id()).subscribe({
      next: () => {
        this.toast.success('Équipe supprimée');
        void this.router.navigate(['/teams']);
      },
      error: (err) => this.toast.error(this.parseErr(err)),
    });
  }

  // ---- Internal ----

  private load(): void {
    this.loading.set(true);
    this.teamsService.get(this.id()).subscribe({
      next: (team) => {
        this.team.set(team);
        this.members.set(team.members ?? []);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err); this.loading.set(false); },
    });
  }

  private reloadMembers(): void {
    this.teamsService.listMembers(this.id()).subscribe({
      next: (members) => this.members.set(members),
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
