import { z } from "zod";

export const permissionsSchema = z.object({
  id: z.uuid(),
  permission: z
    .string()
    .min(1, { message: "Permission is required!" })
    .max(255, { message: "Permission name max lenght of 255 characters!" }),
  description: z.string().nullable().optional(),
});
