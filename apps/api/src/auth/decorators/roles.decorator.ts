import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../user/user.entity";


/**
 * Roles decorator to specify user roles for route handlers.
 * This is used in conjunction with the RolesGuard to restrict access
 * based on user roles.
 *
 * @param roles - Array of UserRole that the route handler should be accessible to.
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
