import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import {
  createBusinessSchema,
  createRoleSchema,
} from "../../db/schemas/business/business.dto";
import { validateUUID } from "../../core/middlewares/validators";
import {
  business_assignRole,
  business_createBusiness,
  business_createRole,
  business_roleInfo,
  business_rolesInfo,
  business_upsertRolePermissions,
} from "../business/business.controller"
import { permissionListSchema } from "../../db/schemas/permissions/permission.dto";
import { userId } from "../../db/schemas/users/users.dto";

export const businessRoutes = new Hono().basePath("/business");

businessRoutes.post(
  "create/:userId",
  describeRoute({
    summary: "Create a new business",
    tags: ["Business"],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "The Company",
              },
            },
            required: ["name"],
          },
        },
      },
      required: true,
    },
  }),
  sValidator("json", createBusinessSchema),
  async (c) => {
    const { userId } = c.req.param();
    const validated_userId = validateUUID(userId);
    const dto = c.req.valid("json");

    await business_createBusiness(validated_userId, dto);

    return c.text("Business created");
  },
);

businessRoutes.post(
  "create-role/:userId/:businessId",
  describeRoute({
    operationId: "businessCreateRole",
    summary: "Create a new role inside a business",
    description: `
Creates a new role within the specified business.

- Only users with the **Manage Staff Members** permission can perform this action.
- The role is created under the target business and becomes available for staff assignment.
- The operation validates:
  - The user exists
  - The business exists
  - The user has permission to manage staff members
- If any validation fails, a corresponding error is returned.
    `,
    tags: ["Business", "Roles"],
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "UUID of the user performing the action.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
      {
        name: "businessId",
        in: "path",
        required: true,
        description: "UUID of the business where the role will be created.",
        schema: {
          type: "string",
          format: "uuid",
          example: "c91f2b8e-5678-4abc-9def-987654321000",
        },
      },
    ],
    requestBody: {
      required: true,
      description:
        "Role information to be created inside the business. Only the role name is required.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
                description: "Human-readable name of the role.",
                example: "Staff Manager",
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "Role created successfully inside the business.",
      },
      400: {
        description: "Invalid user ID, business ID, or request body.",
      },
      401: {
        description: "Authentication required to access this endpoint.",
      },
      403: {
        description:
          "User does not have permission to manage staff members in this business.",
      },
      404: {
        description: "User or business not found.",
      },
      500: {
        description: "Unexpected server error while creating the role.",
      },
    },
  }),
  sValidator("json", createRoleSchema),
  async (c) => {
    const { userId, businessId } = c.req.param();
    const validated_userId = validateUUID(userId);
    const validated_businessId = validateUUID(businessId);
    const dto = c.req.valid("json");

    const newRole = await business_createRole(
      validated_userId,
      validated_businessId,
      dto,
    );

    return c.text(`New role created: ${dto.name}-${newRole}!`);
  },
);

businessRoutes.patch(
  "update-rolePermissions/:userId/:businessId/:roleId",
  describeRoute({
    operationId: "businessUpdateRolePermissions",
    summary: "Update the permissions assigned to a business role",
    description: `
Updates the full permission list of a specific role inside a business.

- Only users with the **Manage Staff Members** permission can perform this action.
- The operation replaces the role's current permissions with the provided list.
- Validation ensures:
  - The user exists
  - The business exists
  - The role exists
  - The user has permission to manage staff members
- If the role does not exist, a not-found error is returned.
- This endpoint is typically used in staff management dashboards and role configuration screens.
    `,
    tags: ["Business", "Roles", "Permissions"],
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "UUID of the user performing the update.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
      {
        name: "businessId",
        in: "path",
        required: true,
        description: "UUID of the business where the role belongs.",
        schema: {
          type: "string",
          format: "uuid",
          example: "c91f2b8e-5678-4abc-9def-987654321000",
        },
      },
      {
        name: "roleId",
        in: "path",
        required: true,
        description: "UUID of the role whose permissions will be updated.",
        schema: {
          type: "string",
          format: "uuid",
          example: "d12f3a9b-1111-4aaa-8bbb-123456789abc",
        },
      },
    ],
    requestBody: {
      required: true,
      description:
        "List of permission IDs to assign to the role. The list fully replaces the existing permissions.",
      content: {
        "application/json": {
          schema: {
            type: "array",
            description: "Array of permission identifiers.",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  description: "UUID of the permission.",
                  example: "b81b3a0e-ff2c-4168-bead-b9320aa25fc1",
                },
              },
              required: ["id"],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Role permissions updated successfully.",
      },
      400: {
        description: "Invalid user ID, business ID, role ID, or request body.",
      },
      401: {
        description: "Authentication required to access this endpoint.",
      },
      403: {
        description:
          "User does not have permission to manage staff members in this business.",
      },
      404: {
        description: "Role not found.",
      },
      500: {
        description:
          "Unexpected server error while updating the role permissions.",
      },
    },
  }),
  sValidator("json", permissionListSchema),
  async (c) => {
    const { userId, businessId, roleId } = c.req.param();
    const validated_userId = validateUUID(userId);
    const validated_businessId = validateUUID(businessId);
    const validated_roleId = validateUUID(roleId);

    const permissionList = c.req.valid("json");

    await business_upsertRolePermissions(
      validated_userId,
      validated_businessId,
      validated_roleId,
      permissionList,
    );

    return c.text("Role permission list updated!")
  },
);

businessRoutes.get(
  "business-rolesInfo/:userId/:businessId",
  describeRoute({
    operationId: "businessGetRolesInfo",
    summary: "Retrieve all roles and their permissions for a business",
    description: `
Returns detailed information about every role within a business, including the permissions assigned to each role.

- Only members of the business can access this endpoint.
- Useful for staff management dashboards, permission audits, and role configuration screens.
- The response includes:
  - Role ID and name
  - All permissions assigned to each role
  - Permission metadata (name, description)
- The business is guaranteed to have at least one role ("Owner").
- If the user is not a member of the business, access is denied.
    `,
    tags: ["Business", "Roles", "Permissions"],
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "UUID of the user requesting the business role information.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
      {
        name: "businessId",
        in: "path",
        required: true,
        description: "UUID of the business whose roles will be retrieved.",
        schema: {
          type: "string",
          format: "uuid",
          example: "c91f2b8e-5678-4abc-9def-987654321000",
        },
      },
    ],
    responses: {
      200: {
        description:
          "Roles and their associated permissions retrieved successfully.",
      },
      400: {
        description: "Invalid user ID or business ID provided.",
      },
      401: {
        description: "Authentication required to access this endpoint.",
      },
      403: {
        description:
          "User is not a member of the business and cannot access its role information.",
      },
      404: {
        description: "Business or user not found.",
      },
      500: {
        description:
          "Unexpected server error while retrieving business role information.",
      },
    },
  }),
  async (c) => {
    const { userId, businessId } = c.req.param();
    const validated_userId = validateUUID(userId);
    const validated_businessId = validateUUID(businessId);

    return c.json(
      await business_rolesInfo(validated_userId, validated_businessId),
    );
  },
);


businessRoutes.get(
  "business.roleInfo/:userId/:businessId/:roleId",
  describeRoute({
    operationId: "businessGetRoleInfo",
    summary: "Retrieve detailed information about a specific business role",
    description: `
Returns complete information about a single role inside a business, including all permissions assigned to it.

- Only members of the business can access this endpoint.
- The operation validates:
  - The user exists
  - The business exists
  - The user is a member of the business
  - The role exists
- The response includes:
  - Role ID and name
  - All permissions assigned to the role
  - Permission metadata (name, description)
- Useful for role configuration screens, permission audits, and staff management dashboards.
    `,
    tags: ["Business", "Roles", "Permissions"],
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "UUID of the user requesting the role information.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
      {
        name: "businessId",
        in: "path",
        required: true,
        description: "UUID of the business where the role belongs.",
        schema: {
          type: "string",
          format: "uuid",
          example: "c91f2b8e-5678-4abc-9def-987654321000",
        },
      },
      {
        name: "roleId",
        in: "path",
        required: true,
        description: "UUID of the role whose information will be retrieved.",
        schema: {
          type: "string",
          format: "uuid",
          example: "d12f3a9b-1111-4aaa-8bbb-123456789abc",
        },
      },
    ],
    responses: {
      200: {
        description: "Role information retrieved successfully.",
      },
      400: {
        description: "Invalid user ID, business ID, or role ID provided.",
      },
      401: {
        description: "Authentication required to access this endpoint.",
      },
      403: {
        description:
          "User is not a member of the business and cannot access its role information.",
      },
      404: {
        description: "Role not found.",
      },
      500: {
        description:
          "Unexpected server error while retrieving the role information.",
      },
    },
  }),
  async (c) => {
    const { userId, businessId, roleId } = c.req.param();
    const validated_userId = validateUUID(userId);
    const validated_businessId = validateUUID(businessId);
    const validated_roleId = validateUUID(roleId);

    return c.json(
      await business_roleInfo(
        validated_userId,
        validated_businessId,
        validated_roleId,
      ),
    );
  },
);

businessRoutes.post(
  "bussiness-assigneRoleToUser/:userId/:businessId/:roleId",
  describeRoute({
    operationId: "businessAssignRoleToUser",
    summary: "Assign a role to a business member",
    description: `
Assigns an existing role to a user within a business.

- Only users with the **Manage Staff Members** permission can perform this action.
- The operation validates:
  - The acting user exists
  - The business exists
  - The acting user is a member of the business
  - The acting user has permission to manage staff members
  - The target user is a member of the business
  - The role exists
- This endpoint is typically used in staff management dashboards and role assignment workflows.
- If the role or user is not found, a corresponding error is returned.
    `,
    tags: ["Business", "Roles", "Members"],
    parameters: [
      {
        name: "userId",
        in: "path",
        required: true,
        description: "UUID of the user performing the assignment.",
        schema: {
          type: "string",
          format: "uuid",
          example: "b7e1a2c4-1234-4f56-8a9b-abcdef123456",
        },
      },
      {
        name: "businessId",
        in: "path",
        required: true,
        description: "UUID of the business where the role assignment will occur.",
        schema: {
          type: "string",
          format: "uuid",
          example: "c91f2b8e-5678-4abc-9def-987654321000",
        },
      },
      {
        name: "roleId",
        in: "path",
        required: true,
        description: "UUID of the role to assign to the target user.",
        schema: {
          type: "string",
          format: "uuid",
          example: "d12f3a9b-1111-4aaa-8bbb-123456789abc",
        },
      },
    ],
    requestBody: {
      required: true,
      description:
        "The UUID of the user who will receive the role. Must be a member of the business.",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["id"],
            properties: {
              id: {
                type: "string",
                format: "uuid",
                description: "UUID of the user to assign the role to.",
                example: "e21f4c9d-2222-4ccc-9ddd-987654321abc",
              },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Role assigned to the user successfully.",
      },
      400: {
        description:
          "Invalid user ID, business ID, role ID, or request body provided.",
      },
      401: {
        description: "Authentication required to access this endpoint.",
      },
      403: {
        description:
          "Acting user does not have permission to manage staff members.",
      },
      404: {
        description: "Role or target user not found.",
      },
      500: {
        description:
          "Unexpected server error while assigning the role to the user.",
      },
    },
  }),
  sValidator("json", userId),
  async (c) => {
    const { userId, businessId, roleId } = c.req.param()
    const validated_userId = validateUUID(userId);
    const validated_businessId = validateUUID(businessId);
    const validated_roleId = validateUUID(roleId);

    const assignedUserId = c.req.valid("json");

    return c.json(
      await business_assignRole(
        validated_userId,
        validated_businessId,
        validated_roleId,
        assignedUserId.id,
      ),
    );
  },
);

