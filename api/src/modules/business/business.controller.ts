import { HTTPException } from "hono/http-exception";
import { validateBusiness } from "../../core/middlewares/validators";
import {
  type_createBusiness,
  type_createRole,
} from "../../db/schemas/business/business.types";
import { type_permissionId } from "../../db/schemas/permissions/permission.types";
import { businessService } from "./business.server";
import { businessRolesPermissionService, businessRolesService } from "./businessRoles.server";
import { HttpStatus } from "../../core/utils/statusCode";

export const business_createBusiness = async (
  userId: string,
  business: type_createBusiness,
) => {
  await validateBusiness({
    userId,
    checkUserExists: true,
  });
  return await businessService.createBusiness(userId, business.name);
};

/**
 * Create a new role for the business
 * Permission to do this: {
 * id:b81b3a0e-ff2c-4168-bead-b9320aa25fc1
 * permission:Manage Staff Members
 * description:Manage Staff Members permission allows the user to add or remove members from the system change permission and roles of the users
 * }
 */
export const business_createRole = async (
  userId: string,
  businessId: string,
  role: type_createRole,
) => {
  await validateBusiness({
    userId: userId,
    businessId: businessId,
    checkUserExists: true,
    checkBusinessExist: true,
    checkUserHasPermission: "b81b3a0e-ff2c-4168-bead-b9320aa25fc1",
  });

  return await businessRolesService.createRole(businessId, role.name);
};

/**
 * Update the permissions of an role
 * Permission to do this: {
 * id:b81b3a0e-ff2c-4168-bead-b9320aa25fc1
 * permission:Manage Staff Members
 * description:Manage Staff Members permission allows the user to add or remove members from the system change permission and roles of the users
 * }
 */
export const business_upsertRolePermissions = async (
  userId: string,
  businessId: string,
  roleId: string,
  listPermissions: Array<type_permissionId>,
) => {
  await validateBusiness({
    userId: userId,
    businessId: businessId,
    checkUserExists: true,
    checkBusinessExist: true,
    checkUserHasPermission: "b81b3a0e-ff2c-4168-bead-b9320aa25fc1",
  });

  // validate if the roleId actualy exists
  const validateRole = await businessRolesService.getRoleById(roleId)
  if (!validateRole) throw new HTTPException(HttpStatus.NOT_FOUND, { message: "Role was not found!" })

  await businessRolesPermissionService.updatePermissionOfRole(validateRole.id, listPermissions)
}
