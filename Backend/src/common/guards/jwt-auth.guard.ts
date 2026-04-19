import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_OPTIONAL_AUTH_KEY, IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  // For @OptionalAuth routes: don't throw on missing/invalid token — just leave req.user undefined.
  handleRequest<T = unknown>(
    err: Error | null,
    user: T,
    _info: unknown,
    context: ExecutionContext,
  ): T {
    const isOptional = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isOptional) {
      // Return the user if we got one, otherwise undefined — never throw.
      // request.user will be set to this value by @nestjs/passport.
      return (user ?? undefined) as T;
    }
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}
