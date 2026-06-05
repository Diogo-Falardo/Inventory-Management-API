import { z } from "zod";
import { usersSchema } from "./users.schema";
import { createUser, loginUser, userId } from "./users.dto";

export type type_userSchema = z.infer<typeof usersSchema>;
export type type_createUser = z.infer<typeof createUser>;
export type type_loginUser = z.infer<typeof loginUser>;
export type type_userId = z.infer<typeof userId>;
