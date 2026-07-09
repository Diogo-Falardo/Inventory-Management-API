import { z } from "zod";
import {
  createBusinessSchema,
  createRoleSchema,
  memberInfoSchema,
} from "./business.dto";
import {
  businessRolesPermissionsSchema,
  businessRolesSchema,
  businessSchema,
} from "./business.schema";

export type type_createBusiness = z.infer<typeof createBusinessSchema>;
export type type_businessSchema = z.infer<typeof businessSchema>;
export type type_createRole = z.infer<typeof createRoleSchema>;
export type type_memberInfo = z.infer<typeof memberInfoSchema>;
export type type_rolesPermission = z.infer<
  typeof businessRolesPermissionsSchema
>;
export type type_role = z.infer<typeof businessRolesSchema>
