import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { environment } from '@env/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Only attach to our own API
  const isOurApi =
    req.url.startsWith(environment.apiBaseUrl) ||
    req.url.startsWith('/api') ||
    req.url.includes('/api/');

  if (token && isOurApi) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
