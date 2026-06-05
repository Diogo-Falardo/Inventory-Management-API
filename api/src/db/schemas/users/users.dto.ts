import { usersSchema } from "./users.schema";

export const createUser = usersSchema.pick({
  email: true,
  password: true,
});

export const loginUser = usersSchema.pick({
  email: true,
  password: true,
});

export const userId = usersSchema.pick({
  id: true,
});
