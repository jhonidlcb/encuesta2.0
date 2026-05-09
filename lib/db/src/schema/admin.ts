import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const adminSettingsTable = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export type AdminSetting = typeof adminSettingsTable.$inferSelect;
