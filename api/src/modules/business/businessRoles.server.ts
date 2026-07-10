import { HTTPException } from "hono/http-exception";
import { throwError } from "../../core/middlewares/error";
import { log } from "../../core/middlewares/logger";
import { db } from "../../db/db.index";
import {
  table_business_roles,
  table_business_roles_permissions,
} from "../../db/schema";
import { type_permissionId } from "../../db/schemas/permissions/permission.types";
import { HttpStatus } from "../../core/utils/statusCode";
import { and, eq } from "drizzle-orm";
import { businessMemebersService } from "./businessMembers.server";
import { type_role, type_rolesPermission } from "../../db/schemas/business/business.types";
import { businessRolesPermissionsSchema, businessRolesSchema } from "../../db/schemas/business/business.schema";

class businessRolesServer {
  /**
   * create a role inside of a business
   * @param businessId
   * @param name
   */
  async createRole(businessId: string, name: string): Promise<string> {
    try {
      const [role] = await db
        .insert(table_business_roles)
        .values({ businessId, name })
        .returning();

      log.withMetadata({ role }).info("role created");

      return role.id;
    } catch (error) {
      throwError({ error, logError: "businessRolesServer.createRole" });
    }
  }
  async deleteRole(id: string) { }
  async updateRole(id: string) { }

  async getRoleById(id: string): Promise<type_role | null> {
    try {
      const [role] = await db.select().from(table_business_roles).where(eq(table_business_roles.id, id))

      if (!role) return null

      return businessRolesSchema.parse(role)
    } catch (error) {
      throwError({ error, logError: "businessRolesServer.getRoleById" });
    }
  }

  async getRoles(businessId: string): Promise<Array<type_role>> {
    try {
      const roles = await db.select().from(table_business_roles).where(eq(table_business_roles.businessId, businessId))
      return businessRolesSchema.array().parse(roles)
    } catch (error) {
      throwError({ error, logError: "businessRolesServer.getRoles" });
    }
  }
}

class businessRolesPermissionServer {
  async addPermissionToRole(roleId: string, permissionId: string) { }
  /**
   * Given a list of permissions update the role id with that permission list
   * @param roleId
   * @param listPermissions
   */
  async updatePermissionOfRole(
    roleId: string,
    listPermissions: Array<type_permissionId>,
  ) {
    try {
      if (listPermissions.length === 0) {
        log
          .withMetadata({ listPermissions })
          .error("no permissions were found");
        throw new HTTPException(HttpStatus.BAD_REQUEST, {
          message: "0 permissions to set!",
        });
      }

      const checkIfRoleHasPermissions = await this.permissionsOfRole(roleId);
      // if permissions do not have any role, insert all roles from the list provided
      if (checkIfRoleHasPermissions.length === 0) {
        for (const perm of listPermissions) {
          await db
            .insert(table_business_roles_permissions)
            .values({ roleId, permissionId: perm.id });
        }
        log
          .withMetadata({ roleId, listPermissions })
          .info("role was empty of permissions, new permissions set");
      } else {
        const currentSet = new Set(checkIfRoleHasPermissions.map((p) => p.id));
        const newSet = new Set(listPermissions.map((p) => p.id));

        // permissions to add
        const permissionsToAdd = listPermissions.filter(
          (p) => !currentSet.has(p.id),
        );

        // permissions to remove
        const permissionsToRemove = checkIfRoleHasPermissions.filter(
          (p) => !newSet.has(p.id),
        );

        for (const permission of permissionsToAdd) {
          await db
            .insert(table_business_roles_permissions)
            .values({ roleId, permissionId: permission.id });
        }

        for (const permission of permissionsToRemove) {
          await db
            .delete(table_business_roles_permissions)
            .where(
              and(
                eq(table_business_roles_permissions.roleId, roleId),
                eq(
                  table_business_roles_permissions.permissionId,
                  permission.id,
                ),
              ),
            );
        }
      }

      log.withMetadata({ roleId }).info("permission list updated");
    } catch (error) {
      throwError({
        error,
        logError: "businessRolesPermissionServer.updatePermissionOfRole",
      });
    }
  }
  async permissionsOfRole(
    roleId: string,
  ): Promise<Array<type_rolesPermission>> {
    try {
      const permissions = await db
        .select()
        .from(table_business_roles_permissions)
        .where(eq(table_business_roles_permissions.roleId, roleId));

      return businessRolesPermissionsSchema.array().parse(permissions);
    } catch (error) {
      throwError({
        error,
        logError: "businessRolesPermissionServer.permissionsOfRole",
      });
    }
  }
}

export const businessRolesService = new businessRolesServer();
export const businessRolesPermissionService =
  new businessRolesPermissionServer();

/**
 * How to validate if an user has the required permissions
 *
 * from the userId we need to fetch what role is assigned to that user
 * from the roleId that that user has we need to check if it has the permissionId
 *
 * @returns boolean or execpetions
 */
export async function checkIfUserHasPermission(
  userId: string,
  businessId: string,
  permissionId: string,
): Promise<boolean> {
  log
    .withMetadata({ userId, businessId, permissionId })
    .info("checkIfUserHasPermission");
  const userRole = await businessMemebersService.checkMember(
    userId,
    businessId,
  );

  if (!userRole)
    throw new HTTPException(HttpStatus.NOT_FOUND, {
      message: "User not found!",
    });

  const permissionsOfUserRole =
    await businessRolesPermissionService.permissionsOfRole(userRole.roleId);

  const matchPermission = permissionsOfUserRole.find(
    (p) => p.permissionId === permissionId,
  );
  if (!matchPermission) {
    throw new HTTPException(HttpStatus.FORBIDDEN, {
      message: "User doesn't have required permission",
    });
  }

  return true;
}

// note: NEED TO ADD THE BUSINESSID TO THIS
export async function validateRoleId(roleId: string): Promise<type_role> {
  const role = await businessRolesService.getRoleById(roleId)
  if (!role) throw new HTTPException(HttpStatus.NOT_FOUND, { message: "Role was not found" })

  return role
}

