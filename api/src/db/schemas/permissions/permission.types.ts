import { z } from "zod";
import { permissionsSchema } from "./permission.schema";
import {
  createPermission,
  permissionId,
  updatePermission,
} from "./permission.dto";

export type type_permissionSchema = z.infer<typeof permissionsSchema>;
export type type_createPermission = z.infer<typeof createPermission>;
export type type_updatePermission = z.infer<typeof updatePermission>;
export type type_permissionId = z.infer<typeof permissionId>;
