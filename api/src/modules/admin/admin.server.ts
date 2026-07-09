import { HTTPException } from "hono/http-exception";
import { log } from "../../core/middlewares/logger";
import { db } from "../../db/db.index";
import { table_permissions } from "../../db/schema";
import { eq } from "drizzle-orm";
import {
  type_createPermission,
  type_permissionSchema,
  type_updatePermission,
} from "../../db/schemas/permissions/permission.types";
import { HttpStatus } from "../../core/utils/statusCode";
import { permissionsSchema } from "../../db/schemas/permissions/permission.schema";
import {
  GENERIC_BAD_REQUEST_MESSAGE,
  GENERIC_NOT_FOUND_MESSAGE,
  GENERIC_SERVER_ERROR_MESSAGE,
  throwError,
} from "../../core/middlewares/error";

class adminServer {
  async createPermission(
    dto: type_createPermission,
  ): Promise<type_permissionSchema> {
    try {
      const [permission] = await db
        .insert(table_permissions)
        .values(dto)
        .returning();

      if (!permission) {
        log.error("createPermission did not return the permission");
        throw new HTTPException(HttpStatus.INTERNAL_SERVER_ERROR, {
          message: GENERIC_SERVER_ERROR_MESSAGE,
        });
      }

      return permissionsSchema.parse(permission);
    } catch (error) {
      throwError({
        error,
        logError: "adminServer.createPermission",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async deletePermissionById(
    permissionId: string,
  ): Promise<type_permissionSchema> {
    try {
      const [deletedPermission] = await db
        .delete(table_permissions)
        .where(eq(table_permissions.id, permissionId))
        .returning();

      if (!deletedPermission) {
        log
          .withMetadata({ permissionId })
          .error("permission not found for delete");
        throw new HTTPException(HttpStatus.NOT_FOUND, {
          message: GENERIC_NOT_FOUND_MESSAGE,
        });
      }

      return permissionsSchema.parse(deletedPermission);
    } catch (error) {
      throwError({
        error,
        logError: "adminServer.deletePermissionById",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async updatePermissionById(
    permissionId: string,
    dto: type_updatePermission,
  ): Promise<type_permissionSchema> {
    try {
      if (!dto.permission && dto.description === undefined) {
        throw new HTTPException(HttpStatus.BAD_REQUEST, {
          message: GENERIC_BAD_REQUEST_MESSAGE,
        });
      }

      const [updatedPermission] = await db
        .update(table_permissions)
        .set(dto)
        .where(eq(table_permissions.id, permissionId))
        .returning();

      if (!updatedPermission) {
        log
          .withMetadata({ permissionId })
          .error("permission not found for update");
        throw new HTTPException(HttpStatus.NOT_FOUND, {
          message: GENERIC_NOT_FOUND_MESSAGE,
        });
      }

      return permissionsSchema.parse(updatedPermission);
    } catch (error) {
      throwError({
        error,
        logError: "adminServer.updatePermissionById",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async getPermissionByName(
    permissionName: string,
  ): Promise<type_permissionSchema | null> {
    try {
      const [permission] = await db
        .select()
        .from(table_permissions)
        .where(eq(table_permissions.permission, permissionName));

      if (!permission) {
        return null;
      }

      return permissionsSchema.parse(permission);
    } catch (error: any) {
      throwError({
        error,
        logError: "adminServer.getPermissionByName",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async getPermissionById(
    permissionId: string,
  ): Promise<type_permissionSchema> {
    try {
      const [permission] = await db
        .select()
        .from(table_permissions)
        .where(eq(table_permissions.id, permissionId))
        .limit(1);

      if (!permission) {
        log
          .withMetadata({ permissionId })
          .error("permission not found for getbyid");
        throw new HTTPException(HttpStatus.NOT_FOUND, {
          message: GENERIC_NOT_FOUND_MESSAGE,
        });
      }

      return permissionsSchema.parse(permission);
    } catch (error) {
      throwError({
        error,
        logError: "adminServer.getPermissionById",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async getAllPermissions(): Promise<Array<type_permissionSchema>> {
    try {
      const permissions = await db.select().from(table_permissions)

      if (permissions.length === 0) {
        log
          .withMetadata(permissions)
          .error("permissions not found");
        throw new HTTPException(HttpStatus.NOT_FOUND, {
          message: GENERIC_NOT_FOUND_MESSAGE,
        });
      }

      return permissionsSchema.array().parse(permissions)
    } catch (error) {
      throwError({
        error,
        logError: "adminServer.getAllPermissions",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }
}
export const adminService = new adminServer();

/**
 * Validates if a permission name already exists
 * @param permission
 */
export async function checkIfPermissionExistByPermissionName(
  permission: string,
) {
  log
    .withMetadata({ permission_name: permission })
    .info("checkIfPermissionExistByPermissionName");

  const check = await adminService.getPermissionByName(permission);
  if (check) {
    log.withMetadata({ permission }).warn("permission already exists");
    throw new HTTPException(HttpStatus.CONFLICT, {
      message: "Permission already exists!",
    });
  }
}

/**
 *  Validates if the permission exist
 * - If Exists: return permission_id
 * - If not exists: throws an error
 * @param id
 * @returns permissionId
 */
export async function checkIfPermissionExistsByPermissionId(id: string) {
  log
    .withMetadata({ permission_id: id })
    .info("checkIfPermissionExistsByPermissionId");

  const check = await adminService.getPermissionById(id);
  if (check) {
    return check.id;
  }
}
