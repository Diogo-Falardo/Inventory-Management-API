import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { createBusinessSchema } from "../../db/schemas/business/business.dto";
import { validateUUID } from "../../core/middlewares/validators";
import { business_createBusiness } from "./business.controller";

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
