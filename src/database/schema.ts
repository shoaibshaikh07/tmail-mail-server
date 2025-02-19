import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Unique user session ID
  recipientEmail: text("recipient_email").notNull(),
  senderEmail: text("sender_email").notNull(),
  subject: text("subject"),
  body: text("body"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Email = typeof emails.$inferSelect;
