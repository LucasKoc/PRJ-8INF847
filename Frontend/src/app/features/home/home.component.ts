import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <!-- ============== HERO ============== -->
    <section class="relative py-16 md:py-24 animate-in overflow-hidden rounded-lg mb-8">
      <!-- Background image -->
      <img
        src="clash-bg.webp"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover object-center opacity-25 rounded-lg"
      />
      <!-- Dark gradient overlay so text stays readable -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/80 to-transparent rounded-lg"
      ></div>

      <!-- Content sits above the image -->
      <div class="relative z-10">
        <div
          class="inline-flex items-center gap-2 label text-electric px-2.5 py-1 rounded bg-electric/10 border border-electric/30 mb-8"
        >
          <span class="relative flex w-1.5 h-1.5">
            <span
              class="animate-ping absolute inline-flex w-full h-full rounded-full bg-electric opacity-60"
            ></span>
            <span class="relative inline-flex w-1.5 h-1.5 rounded-full bg-electric"></span>
          </span>
          Plateforme communautaire · League of Legends
        </div>

        <h1 class="display-xl text-4xl md:text-6xl lg:text-7xl mb-6 leading-none">
          <span class="block text-ink">Organisez vos</span>
          <span class="block text-electric">tournois esport.</span>
        </h1>

        <p class="text-ink/75 text-lg max-w-xl leading-relaxed mb-10">
          Créez vos équipes, inscrivez-les à des tournois et suivez les inscriptions en temps réel.
          Pensé pour les communautés LoL casual.
        </p>

        <div class="flex items-center gap-3 flex-wrap">
          @if (auth.isAuthenticated()) {
            <a routerLink="/tournament" class="btn btn-primary btn-lg">Voir les tournois →</a>
            @if (auth.isPlayer()) {
              <a routerLink="/teams" class="btn btn-secondary btn-lg">Mes équipes</a>
            }
          } @else {
            <a routerLink="/signup" class="btn btn-primary btn-lg">Créer mon compte →</a>
            <a routerLink="/tournament" class="btn btn-secondary btn-lg">Explorer les tournois</a>
          }
        </div>
      </div>
    </section>

    <!-- ============== FEATURES GRID ============== -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-16">
      <div class="surface p-6">
        <div class="label text-muted mb-3">01</div>
        <h3 class="mb-2">Tournois communautaires</h3>
        <p class="text-sm text-muted leading-relaxed">
          Créez, publiez et gérez vos tournois en simple élimination, formats BO1 ou BO3.
        </p>
      </div>
      <div class="surface p-6">
        <div class="label text-muted mb-3">02</div>
        <h3 class="mb-2">Équipes structurées</h3>
        <p class="text-sm text-muted leading-relaxed">
          5 titulaires + remplaçants = 1 équipe qui gagne
        </p>
      </div>
      <div class="surface p-6">
        <div class="label text-muted mb-3">03</div>
        <h3 class="mb-2">Inscription simple</h3>
        <p class="text-sm text-muted leading-relaxed">
          Le capitaine inscrit son équipe. L'organisateur valide.
        </p>
      </div>
    </section>
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
