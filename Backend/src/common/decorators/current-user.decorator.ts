import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../enums';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
