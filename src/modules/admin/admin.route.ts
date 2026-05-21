import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { createPermission } from "../../db/schemas/permissions/permission.dto";
import { admin_createPermission } from "./admin.function";

export const routerAdmin = new Hono().basePath("/admin");

routerAdmin.post(
  "create-permission",
  describeRoute({
    operationId: "adminCreatePermission",
    summary: "Create a global permission",
    description:
      "Registers a new permission in the system so it can be assigned to roles and used across applications.",
    tags: ["Admin", "Permissions"],
    requestBody: {
      required: true,
      description:
        "High-level permission name and definition to be created globally and reused across applications.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["permission"],
            properties: {
              permission: {
                type: "string",
                description:
                  "Human-readable permission name that describes an allowed capability.",
                example: "Manage Staff Members",
              },
              description: {
                type: "string",
                description:
                  "Self explanatory description what are the capabilitys/functionality of that permission",
                example:
                  "Manage Staff Members permission allows the user to add or remove members from the system change permission and roles of the users",
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description:
          "Permission created successfully and now available for assignment to roles.",
      },
      400: {
        description:
          "Invalid request body or missing required permission information.",
      },
      401: {
        description: "Authentication required to access this endpoint.",
      },
      403: {
        description:
          "Authenticated user is not allowed to create global permissions.",
      },
      409: {
        description:
          "A permission with the same name already exists and cannot be duplicated.",
      },
      500: {
        description: "Unexpected server error while creating the permission.",
      },
    },
  }),
  sValidator("json", createPermission),
  async (c) => {
    const dto = c.req.valid("json");
    const newPermission = await admin_createPermission(dto);
    return c.json({ newPermission });
  },
);
