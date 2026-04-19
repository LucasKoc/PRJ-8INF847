import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';
/**
 * Marks a route as public but still attempts to extract the JWT if present.
 * Used for endpoints where the response shape depends on the authenticated user
 * (e.g. GET /tournaments shows own DRAFT tournaments to the creating TO).
 */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);
