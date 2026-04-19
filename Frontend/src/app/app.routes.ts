import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'teams',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/teams/team-list/team-list.component').then(
                (m) => m.TeamListComponent,
              ),
          },
          {
            path: 'new',
            canActivate: [roleGuard],
            data: { roles: ['PLAYER'] },
            loadComponent: () =>
              import('./features/teams/team-create/team-create.component').then(
                (m) => m.TeamCreateComponent,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/teams/team-detail/team-detail.component').then(
                (m) => m.TeamDetailComponent,
              ),
          },
        ],
      },
      {
        path: 'tournaments',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/tournaments/tournament-list/tournament-list.component'
              ).then((m) => m.TournamentListComponent),
          },
          {
            path: 'new',
            canActivate: [roleGuard],
            data: { roles: ['TO'] },
            loadComponent: () =>
              import(
                './features/tournaments/tournament-create/tournament-create.component'
              ).then((m) => m.TournamentCreateComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                './features/tournaments/tournament-detail/tournament-detail.component'
              ).then((m) => m.TournamentDetailComponent),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
