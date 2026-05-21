import { z } from "zod";
import { permissionsSchema } from "./permission.schema";
import { createPermission } from "./permission.dto";

export type type_permissionSchema = z.infer<typeof permissionsSchema>;
export type type_createPermission = z.infer<typeof createPermission>;
export type type_updatePermission = Partial<type_createPermission>;
