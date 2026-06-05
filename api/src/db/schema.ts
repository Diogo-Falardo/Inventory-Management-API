import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const table_users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  email: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
});

export const table_permissions = pgTable("permissions", {
  id: uuid().defaultRandom().primaryKey(),
  permission: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});

export const table_admin = pgTable("admin", {
  id: uuid().defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => table_users.id),
});
