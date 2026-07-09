import { z } from "zod";

export const businessSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z
    .string()
    .min(1, { message: "Business name is required!" })
    .max(255, { message: "Business name max lenght of 255 characters!" }),
  inviteLink: z.string().optional().nullable(),
});

export const businessRolesSchema = z.object({
  id: z.uuid(),
  businessId: z.uuid(),
  name: z
    .string()
    .min(1, { message: "Business role name is required!" })
    .max(255, { message: "Business role name max lenght of 255 characters!" }),
});

export const businessMembersSchema = z.object({
  id: z.uuid(),
  businessId: z.uuid(),
  userId: z.uuid(),
  roleId: z.uuid(),
});

export const businessRolesPermissionsSchema = z.object({
  id: z.uuid(),
  roleId: z.uuid(),
  permissionId: z.uuid(),
});
