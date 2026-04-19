import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastContainerComponent } from '@shared/ui/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <div class="min-h-dvh flex flex-col">
      <!-- ================== HEADER ================== -->
      <header class="sticky top-0 z-40 bg-abyss/90 backdrop-blur-sm border-b border-border">
        <div class="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group shrink-0">
            <span
              class="flex items-center justify-center w-7 h-7 rounded-md bg-electric/15 border border-electric/40 text-electric"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </span>
            <span class="display text-lg tracking-tight">
              <span class="text-electric">DPS</span><span class="text-ink">CHECK</span>
            </span>
          </a>

          <!-- Main nav -->
          <nav class="flex items-center gap-0.5 text-sm flex-1">
            <a
              routerLink="/tournament"
              routerLinkActive="active-nav"
              class="px-3 py-1.5 rounded-md text-muted hover:text-ink transition-colors"
            >Tournois</a>
            <a
              routerLink="/teams"
              routerLinkActive="active-nav"
              class="px-3 py-1.5 rounded-md text-muted hover:text-ink transition-colors"
            >Équipes</a>
            @if (auth.isPlayer()) {
              <a
                routerLink="/profile"
                routerLinkActive="active-nav"
                class="px-3 py-1.5 rounded-md text-muted hover:text-ink transition-colors"
              >Profil</a>
            }
          </nav>

          <!-- User area -->
          <div class="flex items-center gap-2 shrink-0">
            @if (auth.isAuthenticated()) {
              <div class="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-md bg-surface border border-border">
                <span
                  class="flex items-center justify-center w-6 h-6 rounded-md bg-electric/15 text-electric text-xs font-bold"
                >{{ initial() }}</span>
                <span class="text-sm text-ink">{{ auth.user()?.username }}</span>
                <span class="label text-muted pl-1 border-l border-border">{{ auth.user()?.role }}</span>
              </div>
              <button type="button" (click)="logout()" class="btn btn-ghost btn-sm">
                Déconnexion
              </button>
            } @else {
              <a routerLink="/login" class="btn btn-ghost btn-sm">Connexion</a>
              <a routerLink="/signup" class="btn btn-primary btn-sm">S'inscrire</a>
            }
          </div>
        </div>
      </header>

      <!-- ================== CONTENT ================== -->
      <main class="flex-1 mx-auto w-full max-w-7xl px-4 py-8">
        <router-outlet />
      </main>

      <!-- ================== FOOTER ================== -->
      <footer class="border-t border-border py-6 mt-8">
        <div class="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <p>© 2026 DPSCHECK. Tous droits réservés.</p>
          <p class="italic">Non affilié à Riot Games</p>
        </div>
      </footer>
    </div>

    <app-toast-container />
  `,
  styles: [`
    :host ::ng-deep .active-nav {
      background: var(--color-surface);
      color: var(--color-ink);
    }
  `],
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly initial = computed(() =>
    (this.auth.user()?.username ?? '?').charAt(0).toUpperCase(),
  );

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
