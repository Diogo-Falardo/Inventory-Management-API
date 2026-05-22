import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { db } from "../../db/db.index";
import { table_users } from "../../db/schema";
import { usersSchema } from "../../db/schemas/users/users.schema";
import {
  type_createUser,
  type_userSchema,
} from "../../db/schemas/users/users.types";
import { log } from "../../core/middlewares/logger";
import {
  GENERIC_NOT_FOUND_MESSAGE,
  GENERIC_SERVER_ERROR_MESSAGE,
  throwError,
} from "../../core/middlewares/error";
import { HttpStatus } from "../../core/utils/statusCode";

class userServer {
  async createUser(dto: type_createUser): Promise<type_userSchema> {
    try {
      const encryptedPassword = await argon2.hash(dto.password);

      const [user] = await db
        .insert(table_users)
        .values({ email: dto.email, password: encryptedPassword })
        .returning();

      if (!user) {
        log.error("userServer.createUser did not return the user");
        throw new HTTPException(HttpStatus.INTERNAL_SERVER_ERROR, {
          message: GENERIC_SERVER_ERROR_MESSAGE,
        });
      }

      log
        .withMetadata({ userId: user.id })
        .info("userServer.createUser: user created");
      return usersSchema.parse(user);
    } catch (error) {
      throwError({
        error,
        logError: "userServer.createUser failed",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async deleteUserById(userId: string): Promise<type_userSchema> {
    try {
      const [deletedUser] = await db
        .delete(table_users)
        .where(eq(table_users.id, userId))
        .returning();

      if (!deletedUser) {
        log
          .withMetadata({ userId })
          .error("userServer.deleteUserById: user not found");
        throw new HTTPException(HttpStatus.NOT_FOUND, {
          message: GENERIC_NOT_FOUND_MESSAGE,
        });
      }

      return usersSchema.parse(deletedUser);
    } catch (error) {
      throwError({
        error,
        logError: "userServer.deleteUserById failed",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async getUserById(userId: string): Promise<type_userSchema | null> {
    try {
      const [user] = await db
        .select()
        .from(table_users)
        .where(eq(table_users.id, userId))
        .limit(1);

      if (!user) return null;

      return usersSchema.parse(user);
    } catch (error) {
      throwError({
        error,
        logError: "userServer.getUserById failed",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async getUserByEmail(email: string): Promise<type_userSchema | null> {
    try {
      const [user] = await db
        .select()
        .from(table_users)
        .where(eq(table_users.email, email))
        .limit(1);

      if (!user) return null;

      return usersSchema.parse(user);
    } catch (error) {
      throwError({
        error,
        logError: "userServer.getUserByEmail failed",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
      throwError({
        error,
        logError: "userServer.verifyPassword failed",
        exceptionErrorMessage: GENERIC_SERVER_ERROR_MESSAGE,
      });
    }
  }
}

export const userService = new userServer();

/**
 * Validates that an email is not already registered.
 * Throws CONFLICT if it already exists.
 */
export async function checkIfEmailAlreadyExists(email: string) {
  log.withMetadata({ email }).info("checkIfEmailAlreadyExists");
  const user = await userService.getUserByEmail(email);
  if (user) {
    log.withMetadata({ email }).warn("email already exists");
    throw new HTTPException(HttpStatus.CONFLICT, {
      message: "Email already in use",
    });
  }
}

/**
 * Validates that a user exists by email.
 * Throws NOT_FOUND if it does not exist.
 * Returns the user on success.
 */
export async function checkIfUserExistsByEmail(
  email: string,
): Promise<type_userSchema> {
  log.withMetadata({ email }).info("checkIfUserExistsByEmail");
  const user = await userService.getUserByEmail(email);
  if (!user) {
    log.withMetadata({ email }).warn("user not found by email");
    throw new HTTPException(HttpStatus.NOT_FOUND, {
      message: GENERIC_NOT_FOUND_MESSAGE,
    });
  }
  return user;
}

/**
 * Validates that a user exists by id.
 * Throws NOT_FOUND if it does not exist.
 * Returns the userId on success.
 */
export async function checkIfUserExistsById(id: string): Promise<string> {
  log.withMetadata({ userId: id }).info("checkIfUserExistsById");
  const user = await userService.getUserById(id);
  if (!user) {
    log.withMetadata({ userId: id }).warn("user not found by id");
    throw new HTTPException(HttpStatus.NOT_FOUND, {
      message: GENERIC_NOT_FOUND_MESSAGE,
    });
  }
  return user.id;
}
