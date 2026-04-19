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
import { LolRole, LOL_ROLE_LABEL } from '@core/models/enums';
import { PlayerProfile } from '@core/models/entities';
import { ErrorMessageComponent } from '@shared/ui/error-message.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ErrorMessageComponent],
  template: `
    <div class="max-w-2xl mx-auto animate-in">
      <div class="mb-6">
        <div class="label text-muted mb-2">Compte joueur</div>
        <h1>Profil League of Legends</h1>
        <p class="text-sm text-muted mt-1">
          Connecté en tant que <span class="text-ink font-medium">{{ auth.user()?.username }}</span>
        </p>
      </div>

      @if (loading()) {
        <div class="surface p-6 animate-pulse h-48"></div>
      } @else {
        <div class="surface p-6">
          @if (!hasProfile() && !editing()) {
            <div class="text-center py-6">
              <div
                class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-raised border border-border text-muted mb-4"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-6 h-6"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M3 21v-1a8 8 0 0116 0v1" />
                </svg>
              </div>
              <h3 class="mb-2">Aucun profil pour l'instant</h3>
              <p class="text-sm text-muted mb-5 max-w-sm mx-auto">
                Créez votre profil LoL pour rejoindre des équipes et participer aux tournois.
              </p>
              <button type="button" class="btn btn-primary btn-md" (click)="startCreate()">
                Créer mon profil
              </button>
            </div>
          }

          @if (hasProfile() && !editing()) {
            <dl class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3.5 text-sm">
              <dt class="label text-muted self-center">Summoner</dt>
              <dd class="text-ink">
                <span class="tag-mono">{{ profile()!.summonerName }}</span>
                <span class="text-muted">#{{ profile()!.tagLine }}</span>
              </dd>

              <dt class="label text-muted self-center">Région</dt>
              <dd class="text-ink">{{ profile()!.region }}</dd>

              <dt class="label text-muted self-center">Rôle</dt>
              <dd class="text-ink">
                @if (profile()!.mainRole; as role) {
                  <span
                    class="inline-flex px-2 py-0.5 rounded bg-raised text-xs font-medium border border-border"
                  >
                    {{ roleLabel(role) }}
                  </span>
                } @else {
                  <span class="text-muted">—</span>
                }
              </dd>

              <dt class="label text-muted self-center">Rang</dt>
              <dd class="text-ink">
                @if (profile()!.rank; as rank) {
                  <span class="inline-flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-gold"></span>
                    {{ rank }}
                  </span>
                } @else {
                  <span class="text-muted">—</span>
                }
              </dd>

              <dt class="label text-muted">Bio</dt>
              <dd class="text-ink whitespace-pre-wrap text-sm leading-relaxed">
                {{ profile()!.bio ?? '—' }}
              </dd>
            </dl>
            <div class="flex gap-2 mt-6 pt-5 border-t border-border">
              <button type="button" class="btn btn-secondary btn-md" (click)="startEdit()">
                Modifier
              </button>
              <button type="button" class="btn btn-danger btn-md" (click)="remove()">
                Supprimer
              </button>
            </div>
          }

          @if (editing()) {
            <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="field">
                  <label class="field-label" for="summonerName">Summoner name</label>
                  <input
                    id="summonerName"
                    type="text"
                    formControlName="summonerName"
                    class="input"
                  />
                </div>
                <div class="field">
                  <label class="field-label" for="tagLine">Tag line</label>
                  <input
                    id="tagLine"
                    type="text"
                    formControlName="tagLine"
                    class="input"
                    placeholder="EUW"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="field">
                  <label class="field-label" for="region">Région</label>
                  <input
                    id="region"
                    type="text"
                    formControlName="region"
                    class="input"
                    placeholder="EUW1"
                  />
                </div>
                <div class="field">
                  <label class="field-label" for="mainRole">Rôle principal</label>
                  <select id="mainRole" formControlName="mainRole" class="select">
                    <option [value]="null">—</option>
                    @for (r of lolRoles; track r) {
                      <option [value]="r">{{ roleLabel(r) }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="rank">Rang</label>
                <input
                  id="rank"
                  type="text"
                  formControlName="rank"
                  class="input"
                  placeholder="Diamond II"
                />
              </div>

              <div class="field">
                <label class="field-label" for="bio">Bio</label>
                <textarea id="bio" rows="3" formControlName="bio" class="textarea"></textarea>
              </div>

              <app-error-message [error]="error()" />

              <div class="flex gap-2 pt-2">
                <button
                  type="submit"
                  [disabled]="form.invalid || saving()"
                  class="btn btn-primary btn-md"
                >
                  {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
                </button>
                <button type="button" class="btn btn-ghost btn-md" (click)="cancel()">
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

  readonly hasProfile = computed(() => this.profile() !== null);
  readonly lolRoles = Object.values(LolRole);

  readonly form = this.fb.nonNullable.group({
    summonerName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    tagLine: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z0-9]+$/),
      ],
    ],
    region: ['EUW1', [Validators.required, Validators.maxLength(20)]],
    rank: [''],
    mainRole: [null as LolRole | null],
    bio: [''],
  });

  roleLabel(r: LolRole): string {
    return LOL_ROLE_LABEL[r];
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.profiles.me().subscribe({
      next: p => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) this.profile.set(null);
        else this.error.set(err);
        this.loading.set(false);
      },
    });
  }

  startCreate(): void {
    this.form.reset({
      region: 'EUW1',
      summonerName: '',
      tagLine: '',
      rank: '',
      mainRole: null,
      bio: '',
    });
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
    const payload = {
      ...raw,
      mainRole: raw.mainRole ?? undefined,
      rank: raw.rank || undefined,
      bio: raw.bio || undefined,
    };

    const req$ = this.hasProfile() ? this.profiles.update(payload) : this.profiles.create(payload);

    req$.subscribe({
      next: p => {
        this.profile.set(p);
        this.editing.set(false);
        this.saving.set(false);
        this.toast.success('Profil enregistré');
      },
      error: err => {
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
