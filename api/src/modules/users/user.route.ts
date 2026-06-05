import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { describeRoute } from "hono-openapi";
import {
  createUser,
  loginUser,
  userId,
} from "../../db/schemas/users/users.dto";
import {
  user_createUser,
  user_deleteUser,
  user_getUserInfo,
  user_loginUser,
} from "./user.function";

export const userRoutes = new Hono().basePath("/user");

userRoutes.post(
  "register",
  describeRoute({
    operationId: "registerUser",
    summary: "Register a new user",
    description:
      "Creates a new user account with the provided email and password. Fails if the email is already registered. The password is securely encrypted before storage.",
    tags: ["User", "Authentication"],
    requestBody: {
      required: true,
      description: "User registration credentials.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: {
                type: "string",
                format: "email",
                description: "User's unique email address.",
                example: "user@example.com",
              },
              password: {
                type: "string",
                description:
                  "User's password. Must be at least 6 characters and contain uppercase, lowercase, number, and special character.",
                example: "StrongPass1!",
              },
            },
          },
        },
      },
    },
    responses: {
      201: { description: "User registered successfully." },
      400: { description: "Invalid request body or missing required fields." },
      409: { description: "Email is already registered." },
      500: { description: "Unexpected server error while registering user." },
    },
  }),
  sValidator("json", createUser),
  async (c) => {
    const dto = c.req.valid("json");
    const newUser = await user_createUser(dto);
    return c.json({ id: newUser.id, email: newUser.email }, 201);
  },
);

userRoutes.post(
  "login",
  describeRoute({
    operationId: "loginUser",
    summary: "Authenticate a user",
    description:
      "Authenticates a user by email and password. Returns the userId on success. The password is verified against the stored encrypted hash.",
    tags: ["User", "Authentication"],
    requestBody: {
      required: true,
      description: "User login credentials.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: {
                type: "string",
                format: "email",
                description: "Registered email address.",
                example: "user@example.com",
              },
              password: {
                type: "string",
                description: "Account password.",
                example: "StrongPass1!",
              },
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Authentication successful. Returns the userId." },
      400: { description: "Invalid request body or missing required fields." },
      401: { description: "Invalid credentials." },
      404: { description: "User not found." },
      500: { description: "Unexpected server error while authenticating." },
    },
  }),
  sValidator("json", loginUser),
  async (c) => {
    const dto = c.req.valid("json");
    const authUserId = await user_loginUser(dto);
    return c.json({ userId: authUserId });
  },
);

userRoutes.get(
  "info/:userId",
  describeRoute({
    operationId: "getUserInfo",
    summary: "Get user information",
    description:
      "Returns the email address of a user by their unique identifier. Only the email is returned, never sensitive data such as the password.",
    tags: ["User"],
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The UUID of the user.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
    ],
    responses: {
      200: { description: "Returns the user's email address." },
      401: { description: "Authentication required." },
      404: { description: "User not found." },
      500: { description: "Unexpected server error while fetching user." },
    },
  }),
  async (c) => {
    const { userId } = c.req.param();
    const email = await user_getUserInfo(userId);
    return c.json({ email });
  },
);

userRoutes.delete(
  "delete/:userId",
  describeRoute({
    operationId: "deleteUser",
    summary: "Delete a user",
    description:
      "Permanently deletes a user account by their unique identifier. This action cannot be undone. Only admins should be allowed to call this endpoint.",
    tags: ["User", "Admin"],
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "The UUID of the user to delete.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
    ],
    responses: {
      200: { description: "User deleted successfully." },
      401: { description: "Authentication required." },
      403: { description: "Not authorized to delete users." },
      404: { description: "User not found." },
      500: { description: "Unexpected server error while deleting user." },
    },
  }),
  async (c) => {
    const { userId } = c.req.param();
    const deleted = await user_deleteUser(userId);
    return c.json({ deleted: deleted.id });
  },
);
