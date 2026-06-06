import { validateBusiness } from "../../core/middlewares/validators";
import { type_createBusiness } from "../../db/schemas/business/business.types";
import { businessService } from "./business.server";

export const business_createBusiness = async (
  userId: string,
  business: type_createBusiness,
) => {
  await validateBusiness({
    userId,
    checkUserExists: true,
  });
  return await businessService.createBusiness(userId, business.name);
};
