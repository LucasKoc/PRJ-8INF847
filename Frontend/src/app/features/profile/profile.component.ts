import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { ProfilesService } from '@core/services/profiles.service';
import { ToastService } from '@core/services/toast.service';
import { LolRole } from '@core/models/enums';
import { PlayerProfile } from '@core/models/entities';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorMessageComponent],
  template: `
    <div class="max-w-2xl mx-auto py-6">
      <h1 class="text-2xl font-semibold mb-1">Profil joueur</h1>
      <p class="text-sm text-muted-foreground mb-6">
        Connecté en tant que
        <strong>{{ auth.user()?.username }}</strong>
      </p>

      @if (loading()) {
        <p class="text-muted-foreground">Chargement…</p>
      } @else {
      <div class="rounded-lg border border-border bg-card p-6">
        @if (!hasProfile() && !editing()) {
          <p class="text-sm text-muted-foreground mb-4">
            Vous n'avez pas encore de profil joueur. Créez-le pour rejoindre
            des équipes et participer à des tournois.
          </p>
          <button
              type="button"
              (click)="startCreate()"
              class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Créer mon profil
          </button>
        }

        @if (hasProfile() && !editing()) {
          <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            <dt class="font-medium text-muted-foreground">Summoner</dt>
            <dd>{{ profile()!.summonerName }}#{{ profile()!.tagLine }}</dd>

            <dt class="font-medium text-muted-foreground">Région</dt>
            <dd>{{ profile()!.region }}</dd>

            <dt class="font-medium text-muted-foreground">Rôle principal</dt>
            <dd>{{ profile()!.mainRole ?? '—' }}</dd>

            <dt class="font-medium text-muted-foreground">Rank</dt>
            <dd>{{ profile()!.rank ?? '—' }}</dd>

            <dt class="font-medium text-muted-foreground">Bio</dt>
            <dd class="whitespace-pre-wrap">{{ profile()!.bio ?? '—' }}</dd>
          </dl>
          <div class="flex gap-2 mt-6">
            <button
                type="button"
                (click)="startEdit()"
                class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Modifier
            </button>
            <button
                type="button"
                (click)="remove()"
                class="inline-flex items-center justify-center rounded-md border border-destructive/50 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/10"
            >
              Supprimer
            </button>
          </div>
        }

        @if (editing()) {
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium" for="summonerName">
                  Summoner Name
                </label>
                <input
                    id="summonerName"
                    type="text"
                    formControlName="summonerName"
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium" for="tagLine">
                  Tag line
                </label>
                <input
                    id="tagLine"
                    type="text"
                    formControlName="tagLine"
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium" for="region">Région</label>
                <input
                    id="region"
                    type="text"
                    formControlName="region"
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium" for="mainRole">
                  Rôle principal
                </label>
                <select
                    id="mainRole"
                    formControlName="mainRole"
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option [value]="null">—</option>
                  @for (role of lolRoles; track role) {
                    <option [value]="role">{{ role }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="rank">Rank</label>
              <input
                  id="rank"
                  type="text"
                  formControlName="rank"
                  placeholder="Diamond II"
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium" for="bio">Bio</label>
              <textarea
                  id="bio"
                  rows="3"
                  formControlName="bio"
                  class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              ></textarea>
            </div>

            <app-error-message [error]="error()" />

            <div class="flex gap-2">
              <button
                  type="submit"
                  [disabled]="form.invalid || saving()"
                  class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
              <button
                  type="button"
                  (click)="cancel()"
                  class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Annuler
              </button>
            </div>
          </form>
        }
      </div>
    }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profiles = inject(ProfilesService);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editing = signal(false);
  readonly error = signal<unknown>(null);
  readonly profile = signal<PlayerProfile | null>(null);

  readonly lolRoles = Object.values(LolRole);

  readonly hasProfile = computed(() => this.profile() !== null);

  readonly form = this.fb.nonNullable.group({
    summonerName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    tagLine: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(10), Validators.pattern(/^[A-Za-z0-9]+$/)],
    ],
    region: ['EUW1', [Validators.required, Validators.maxLength(20)]],
    rank: [''],
    mainRole: [null as LolRole | null],
    bio: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.profiles.me().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.profile.set(null);
        } else {
          this.error.set(err);
        }
        this.loading.set(false);
      },
    });
  }

  startCreate(): void {
    this.form.reset({ region: 'EUW1', summonerName: '', tagLine: '', rank: '', mainRole: null, bio: '' });
    this.editing.set(true);
  }

  startEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.form.patchValue({
      summonerName: p.summonerName,
      tagLine: p.tagLine,
      region: p.region,
      rank: p.rank ?? '',
      mainRole: p.mainRole ?? null,
      bio: p.bio ?? '',
    });
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
    this.error.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    // Le select renvoie null quand rien n'est choisi, mais les DTOs attendent undefined
    const payload = {
      ...raw,
      mainRole: raw.mainRole ?? undefined,
      rank: raw.rank || undefined,
      bio: raw.bio || undefined,
    };

    const request$ = this.hasProfile()
        ? this.profiles.update(payload)
        : this.profiles.create(payload);

    request$.subscribe({
      next: (p) => {
        this.profile.set(p);
        this.editing.set(false);
        this.saving.set(false);
        this.toast.success('Profil enregistré');
      },
      error: (err) => {
        this.error.set(err);
        this.saving.set(false);
      },
    });
  }

  remove(): void {
    if (!confirm('Supprimer votre profil joueur ? Cette action est irréversible.')) return;
    this.profiles.remove().subscribe({
      next: () => {
        this.profile.set(null);
        this.toast.success('Profil supprimé');
      },
      error: (err) => this.error.set(err),
    });
  }
}
