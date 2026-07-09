import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import {
  createBusinessSchema,
  createRoleSchema,
} from "../../db/schemas/business/business.dto";
import { validateUUID } from "../../core/middlewares/validators";
import {
  business_createBusiness,
  business_createRole,
} from "./business.controller";
import { log } from "../../core/middlewares/logger";

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
    const validated_UserId = validateUUID(userId);
    const dto = c.req.valid("json");

    await business_createBusiness(validated_UserId, dto);

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
    const validated_UserId = validateUUID(userId);
    const validated_businessId = validateUUID(businessId);
    const dto = c.req.valid("json");

    const newRole = await business_createRole(
      validated_UserId,
      validated_businessId,
      dto,
    );

    return c.text(`New role Created: ${dto.name}-${newRole}`);
  },
);
