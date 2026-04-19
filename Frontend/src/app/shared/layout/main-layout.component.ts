import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastContainerComponent } from '@shared/ui/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <header class="border-b border-border bg-card">
        <div class="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="text-primary">DPS</span
            ><span class="text-muted-foreground">CHECK</span>
          </a>

          <nav class="hidden md:flex items-center gap-1 text-sm">
            @if (auth.isAuthenticated()) {
              <a
                routerLink="/tournaments"
                routerLinkActive="bg-secondary"
                class="px-3 py-1.5 rounded-md hover:bg-secondary transition-colors"
                >Tournois</a
              >
              <a
                routerLink="/teams"
                routerLinkActive="bg-secondary"
                class="px-3 py-1.5 rounded-md hover:bg-secondary transition-colors"
                >Équipes</a
              >
              @if (auth.isPlayer()) {
                <a
                  routerLink="/profile"
                  routerLinkActive="bg-secondary"
                  class="px-3 py-1.5 rounded-md hover:bg-secondary transition-colors"
                  >Profil</a
                >
              }
            }
          </nav>

          <div class="flex items-center gap-3 text-sm">
            @if (auth.isAuthenticated()) {
              <span class="text-muted-foreground hidden sm:inline">
                {{ auth.user()?.username }}
                <span
                  class="ml-1 inline-block rounded px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground"
                >
                  {{ auth.user()?.role }}
                </span>
              </span>
              <button
                type="button"
                (click)="logout()"
                class="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Déconnexion
              </button>
            } @else {
              <a
                routerLink="/login"
                class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
                >Connexion</a
              >
              <a
                routerLink="/register"
                class="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >Inscription</a
              >
            }
          </div>
        </div>
      </header>

      <main class="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <router-outlet />
      </main>

      <footer class="border-t border-border py-4 text-center text-xs text-muted-foreground">
        DPSCHECK 
      </footer>
    </div>

    <app-toast-container />
  `,
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
