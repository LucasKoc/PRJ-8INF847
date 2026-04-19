import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="text-center py-12">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">
        <span class="text-primary">DPS</span>CHECK
      </h1>
      <p class="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
        La plateforme communautaire pour gérer vos tournois et équipes
        <em>League of Legends</em>.
      </p>
      <div class="flex items-center justify-center gap-3">
        @if (auth.isAuthenticated()) {
          <a
            routerLink="/tournaments"
            class="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Voir les tournois
          </a>
          <a
            routerLink="/teams"
            class="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Mes équipes
          </a>
        } @else {
          <a
            routerLink="/register"
            class="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Créer un compte
          </a>
          <a
            routerLink="/login"
            class="inline-flex items-center justify-center rounded-md border border-input px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Se connecter
          </a>
        }
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div class="rounded-lg border border-border bg-card p-5">
        <h3 class="font-semibold mb-2">🏆 Tournois</h3>
        <p class="text-sm text-muted-foreground">
          Les <strong>TO</strong> créent, publient et arbitrent des tournois
          avec formats personnalisés.
        </p>
      </div>
      <div class="rounded-lg border border-border bg-card p-5">
        <h3 class="font-semibold mb-2">👥 Équipes</h3>
        <p class="text-sm text-muted-foreground">
          Créez votre équipe, gérez l'effectif (5 titulaires + remplaçants) et
          les rôles de chacun.
        </p>
      </div>
      <div class="rounded-lg border border-border bg-card p-5">
        <h3 class="font-semibold mb-2">📝 Inscriptions</h3>
        <p class="text-sm text-muted-foreground">
          Le capitaine inscrit son équipe. Le TO valide ou rejette la demande.
        </p>
      </div>
    </section>
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
