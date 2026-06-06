import { z } from "zod";
import { createBusinessSchema } from "./business.dto";
import { businessSchema } from "./business.schema";

export type type_createBusiness = z.infer<typeof createBusinessSchema>;
export type type_businessSchema = z.infer<typeof businessSchema>;
