import { throwError } from "../../core/middlewares/error";
import { log } from "../../core/middlewares/logger";
import { db } from "../../db/db.index";
import { table_business_members } from "../../db/schema";

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
}

export const businessMemebersService = new businessMemebersServer();
