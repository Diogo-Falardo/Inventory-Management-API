import { z } from "zod";

export const usersSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  password: z
    .string()
    .min(6)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&]).{6,}$/),
});
