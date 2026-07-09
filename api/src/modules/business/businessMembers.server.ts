import { and, eq } from "drizzle-orm";
import { throwError } from "../../core/middlewares/error";
import { log } from "../../core/middlewares/logger";
import { db } from "../../db/db.index";
import { table_business_members } from "../../db/schema";
import { type_memberInfo } from "../../db/schemas/business/business.types";
import { memberInfoSchema } from "../../db/schemas/business/business.dto";

class businessMemebersServer {
  async addMember(userId: string, businessId: string, roleId: string) {
    try {
      await db
        .insert(table_business_members)
        .values({ userId, businessId, roleId });
      log.withMetadata({ userId, businessId, roleId }).info("new member added");
    } catch (error) {
      throwError({
        error,
        logError: "businessMemebersServer.addMember",
      });
    }
  }

  // returns the memberInfo
  async checkMember(userId: string, businessId: string): Promise<type_memberInfo | null> {
    try {
      const [member] = await db.select().from(table_business_members).where(and(eq(table_business_members.userId, userId), eq(table_business_members.businessId, businessId))).limit(1)

      if (!member) return null

      return memberInfoSchema.parse(member)
    } catch (error) {
      throwError({
        error,
        logError: "businessMemebersServer.checkMember"
      })
    }

  }
}

export const businessMemebersService = new businessMemebersServer();
