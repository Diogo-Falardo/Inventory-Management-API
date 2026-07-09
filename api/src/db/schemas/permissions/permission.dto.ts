import { z } from "zod"
import { permissionsSchema } from "./permission.schema";

export const createPermission = permissionsSchema.pick({
  permission: true,
  description: true,
});

export const permissionId = permissionsSchema.pick({
  id: true,
});

export const updatePermission = createPermission.partial();

export const permissionListSchema = z.array(permissionId)
