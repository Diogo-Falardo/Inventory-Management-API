import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import {
  createPermission,
  permissionId,
  updatePermission,
} from "../../db/schemas/permissions/permission.dto";
import {
  admin_createPermission,
  admin_deletePermission,
  admin_updatePermission,
} from "./admin.function";

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
        "High-level permission name and description to be created globally and reused across applications.",
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

routerAdmin.post(
  "update-permission/:id",
  describeRoute({
    operationId: "adminUpdatePermission",
    summary: "Update a global permission",
    description: `
Updates the details of an existing permission by its unique identifier.

- Only admins should be allowed to use this endpoint.
- You can update the permission's name, description, or both.
- If the permission does not exist, an error is returned.
- Use with caution: changing permission names may affect role assignments and access control.
  `,
    tags: ["Admin", "Permissions"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "The UUID of the permission to update.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
    ],
    requestBody: {
      required: true,
      description:
        "Fields to update for the permission (name, description, or both).",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              permission: {
                type: "string",
                description: "New human-readable permission name.",
                example: "Manage Staff Members",
              },
              description: {
                type: "string",
                description:
                  "Updated description of the permission's capabilities.",
                example:
                  "Allows the user to add or remove staff members and change their roles.",
              },
            },
          },
        },
      },
    },
    responses: {
      200: { description: "Permission updated successfully." },
      400: { description: "Invalid request body or parameters." },
      401: { description: "Authentication required to access this endpoint." },
      403: { description: "User is not authorized to update permissions." },
      404: { description: "Permission not found." },
      500: {
        description: "Unexpected server error while updating the permission.",
      },
    },
  }),
  sValidator("json", updatePermission),
  async (c) => {
    const { id } = c.req.param();
    const dto = c.req.valid("json");
    const updatedPermission = await admin_updatePermission(id, dto);
    return c.json({ updatedPermission });
  },
);

routerAdmin.delete(
  "delete-permission/:id",
  describeRoute({
    operationId: "adminDeletePermission",
    summary: "Delete a global permission",
    description:
      "Deletes a permission by its UUID. This endpoint permanently removes the permission and any role assignments that reference it. Only users with admin privileges should call this endpoint.",
    tags: ["Admin", "Permissions"],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        description: "UUID of the permission to delete.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
    ],
    responses: {
      200: {
        description: "Permission deleted successfully.",
      },
      400: {
        description: "Invalid permission ID provided.",
      },
      401: {
        description: "Authentication required to access this endpoint.",
      },
      403: {
        description: "User is not authorized to delete permissions.",
      },
      404: {
        description: "Permission not found.",
      },
      500: {
        description: "Unexpected server error while deleting the permission.",
      },
    },
  }),
  async (c) => {
    const { id } = c.req.param();
    const deletePermission = await admin_deletePermission(id);
    return c.json({ deleted: deletePermission.id });
  },
);
