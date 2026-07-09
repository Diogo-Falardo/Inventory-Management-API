import { businessMembersSchema, businessRolesSchema, businessSchema } from "./business.schema";

export const createBusinessSchema = businessSchema.pick({
  name: true,
});

export const createRoleSchema = businessRolesSchema.pick({
  name: true
})

export const memberInfoSchema = businessMembersSchema.omit({
  id: true
})


