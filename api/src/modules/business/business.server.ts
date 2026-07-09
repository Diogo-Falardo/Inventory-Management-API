import { eq } from "drizzle-orm";
import { throwError } from "../../core/middlewares/error";
import { log } from "../../core/middlewares/logger";
import { db } from "../../db/db.index";
import { table_business } from "../../db/schema";
import {
  businessRolesPermissionService,
  businessRolesService,
} from "./businessRoles.server";
import { type_businessSchema } from "../../db/schemas/business/business.types";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../../core/utils/statusCode";
import { businessSchema } from "../../db/schemas/business/business.schema";
import { businessMemebersService } from "./businessMembers.server";
import { adminService } from "../admin/admin.server";

class businessServer {
  async createBusiness(userId: string, name: string) {
    try {
      const [business] = await db
        .insert(table_business)
        .values({ userId, name })
        .returning();

      const ownerRole = await businessRolesService.createRole(
        business.id,
        "Owner",
      );
      const allPermissions = await adminService.getAllPermissions();

      log.withMetadata({ allPermissions }).info("permissions");

      await businessRolesPermissionService.updatePermissionOfRole(
        ownerRole,
        allPermissions.map((p) => ({ id: p.id })),
      );

      await businessMemebersService.addMember(userId, business.id, ownerRole);

      log.withMetadata({ userId, name }).info("new business created");
    } catch (error) {
      throwError({
        error,
        logError: "businessServer.createBusiness",
      });
    }
  }
  async deleteBusiness(id: string) { }
  async updateBusiness(id: string) { }

  async getBusinessById(id: string): Promise<type_businessSchema | null> {
    try {
      const [business] = await db
        .select()
        .from(table_business)
        .where(eq(table_business.id, id));

      if (!business) return null;

      return businessSchema.parse(business);
    } catch (error) {
      throwError({
        error,
        logError: "businessServer.getBusinessById",
      });
    }
  }
}

export const businessService = new businessServer();

/**
 * Validates if a business exists
 * if does not exists throws an error
 * @param id
 * @returns businessSchema
 */
export async function checkIfBusinessExistById(
  id: string,
): Promise<type_businessSchema> {
  log.withMetadata({ id }).info("checkIfBusinessExistById");
  const business = await businessService.getBusinessById(id);

  if (!business) {
    log.withMetadata({ id }).error("business not found");
    throw new HTTPException(HttpStatus.NOT_FOUND, {
      message: "Business not found!",
    });
  }

  return businessSchema.parse(business);
}
