import { permissionsSchema } from "./permission.schema";

export const createPermission = permissionsSchema.pick({
  permission: true,
  description: true,
});
