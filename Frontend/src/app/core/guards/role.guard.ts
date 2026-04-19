import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/enums';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = (route.data?.['roles'] ?? []) as UserRole[];
  if (requiredRoles.length === 0) return true;

  const user = auth.user();
  if (user && requiredRoles.includes(user.role)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
