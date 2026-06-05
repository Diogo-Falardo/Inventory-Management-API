import { HTTPException } from "hono/http-exception";
import { log } from "../../core/middlewares/logger";
import { HttpStatus } from "../../core/utils/statusCode";
import { GENERIC_SERVER_ERROR_MESSAGE } from "../../core/middlewares/error";
import {
  type_createUser,
  type_loginUser,
} from "../../db/schemas/users/users.types";
import {
  checkIfEmailAlreadyExists,
  checkIfUserExistsByEmail,
  checkIfUserExistsById,
  userService,
} from "./user.server";

/**
 * Registers a new user.
 * - Validates the email is not already in use.
 * - Delegates creation to the server layer.
 */
export async function user_createUser(dto: type_createUser) {
  await checkIfEmailAlreadyExists(dto.email);
  return await userService.createUser(dto);
}

/**
 * Authenticates a user by email and password.
 * - Validates the user exists.
 * - Verifies the provided password against the stored hash.
 * - Returns the userId on success.
 */
export async function user_loginUser(dto: type_loginUser): Promise<string> {
  const user = await checkIfUserExistsByEmail(dto.email);

  const isPasswordValid = await userService.verifyPassword(
    dto.password,
    user.password,
  );

  if (!isPasswordValid) {
    log.withMetadata({ email: dto.email }).warn("invalid password attempt");
    throw new HTTPException(HttpStatus.UNAUTHORIZED, {
      message: GENERIC_SERVER_ERROR_MESSAGE,
    });
  }

  return user.id;
}

/**
 * Returns a user's email by their userId.
 * - Validates the user exists.
 */
export async function user_getUserInfo(userId: string): Promise<string> {
  await checkIfUserExistsById(userId);
  const user = await userService.getUserById(userId);
  return user!.email;
}

/**
 * Deletes a user by their userId.
 * - Validates the user exists before deletion.
 */
export async function user_deleteUser(userId: string) {
  await checkIfUserExistsById(userId);
  return await userService.deleteUserById(userId);
}
