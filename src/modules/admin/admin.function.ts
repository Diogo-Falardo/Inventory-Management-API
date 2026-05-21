import { HTTPException } from "hono/http-exception";
import { log } from "../../core/middlewares/logger";
import { type_createPermission } from "../../db/schemas/permissions/permission.types";
import {
  adminService,
  checkIfPermissionExistByPermissionName,
} from "./admin.server";

/**
 * Creates a new permission for the entire system
 * @param dto (type_createPermission)
 */
export async function admin_createPermission(dto: type_createPermission) {
  // validate if permission name already exists
  await checkIfPermissionExistByPermissionName(dto.permission);
  return await adminService.createPermission(dto);
}
