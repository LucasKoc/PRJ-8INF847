import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@shared/layout/main-layout.component';
import { authGuard, guestGuard, roleGuard } from '@core/guards/guards';
import { UserRole } from '@core/models/enums';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard, roleGuard(UserRole.PLAYER)],
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'teams',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/teams/team-list/team-list.component').then((m) => m.TeamListComponent),
          },
          {
            path: 'new',
            canActivate: [authGuard, roleGuard(UserRole.PLAYER)],
            loadComponent: () => import('./features/teams/team-create/team-create.component').then((m) => m.TeamCreateComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/teams/team-detail/team-detail.component').then((m) => m.TeamDetailComponent),
          },
        ],
      },
      {
        path: 'tournament',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/tournaments/tournament-list/tournament-list.component').then((m) => m.TournamentListComponent),
          },
          {
            path: 'new',
            canActivate: [authGuard, roleGuard(UserRole.TO)],
            loadComponent: () => import('./features/tournaments/tournament-create/tournament-create.component').then((m) => m.TournamentCreateComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/tournaments/tournament-detail/tournament-detail.component').then((m) => m.TournamentDetailComponent),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
