import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@natours/shared';

export const ROLES_KEY = 'roles';

/** Restrict a route to the given roles (used with RolesGuard). */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
