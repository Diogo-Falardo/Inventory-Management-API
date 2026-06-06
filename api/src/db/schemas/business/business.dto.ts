import { businessSchema } from "./business.schema";

export const createBusinessSchema = businessSchema.pick({
  name: true,
});
