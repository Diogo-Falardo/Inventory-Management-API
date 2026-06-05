import {
  type_createPermission,
  type_updatePermission,
} from "../../db/schemas/permissions/permission.types";
import {
  adminService,
  checkIfPermissionExistByPermissionName,
  checkIfPermissionExistsByPermissionId,
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

/**
 * Updates a permission from the entire system
 * @param id
 * @param dto (updatePermission)
 * @returns permission
 */
export async function admin_updatePermission(
  id: string,
  dto: type_updatePermission,
) {
  // validate if permission exists
  await checkIfPermissionExistsByPermissionId(id);
  return await adminService.updatePermissionById(id, dto);
}

/**
 * Deletes a permission from the entire system
 * @param id
 * @returns permission
 */
export async function admin_deletePermission(id: string) {
  // validate if permission exists
  await checkIfPermissionExistsByPermissionId(id);
  return await adminService.deletePermissionById(id);
}
