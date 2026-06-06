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
  userId: uuid("user_id")
    .notNull()
    .references(() => table_users.id),
});

export const table_business = pgTable("business", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => table_users.id),
  name: varchar({ length: 255 }).notNull(),
  inviteLink: varchar("invite_link", { length: 255 }),
});

export const table_business_roles = pgTable("business_roles", {
  id: uuid().defaultRandom().primaryKey(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => table_business.id),
  name: varchar({ length: 255 }).notNull(),
});

export const table_business_members = pgTable("business_members", {
  id: uuid().defaultRandom().primaryKey(),
  businessId: uuid("business_id")
    .notNull()
    .references(() => table_business.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => table_users.id),
  roleId: uuid("role_id")
    .notNull()
    .references(() => table_business_roles.id),
});

export const table_business_roles_permissions = pgTable(
  "business_roles_permissions",
  {
    id: uuid().defaultRandom().primaryKey(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => table_business_roles.id),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => table_permissions.id),
  },
);
