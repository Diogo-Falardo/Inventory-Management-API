import { password } from "bun";
import { z } from "zod";

export const usersSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  password: z
    .string()
    .min(6)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&]).{6,}$/),
});

export const outUserSchema = usersSchema
  .pick({
    id: true,
    email: true,
  })
  .extend({
    password: z.string(),
  });
