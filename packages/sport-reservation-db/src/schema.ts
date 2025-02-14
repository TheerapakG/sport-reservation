import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const authUserAuthConnection = pgTable(
  "auth_user_auth_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    emailId: integer("email_id").unique(undefined, {
      nulls: "distinct",
    }),
    lineId: varchar("line_id", { length: 64 }).unique(undefined, {
      nulls: "distinct",
    }),
    googleId: varchar("google_id", { length: 64 }).unique(undefined, {
      nulls: "distinct",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("auth_user_auth_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_auth_connection_email_id_idx").on(table.emailId),
    uniqueIndex("auth_user_auth_connection_line_id_idx").on(table.lineId),
    uniqueIndex("auth_user_auth_connection_google_id_idx").on(table.googleId),
  ],
);

export const authUserEmailConnection = pgTable(
  "auth_user_email_connection",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("auth_user_email_connection_email_idx").on(table.email),
    uniqueIndex("auth_user_email_connection_email_password_idx").on(
      table.email,
      table.passwordHash,
    ),
  ],
);

export const userUserProfile = pgTable(
  "user_user_profile",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    name: varchar("name", {}),
    avatar: varchar("avatar", {}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("user_user_profile_public_id_idx").on(table.publicId),
  ],
);

export const userUserGroupType = pgEnum("user_user_group_type", [
  "default",
  "friend",
  "club",
  "event",
]);

export const userUserGroup = pgTable(
  "user_user_group",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    creatorId: uuid("creator_id").notNull(),
    name: varchar("name", {}),
    type: userUserGroupType("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("user_user_group_public_id_idx").on(table.publicId),
    index("user_user_group_creator_id_idx").on(table.creatorId),
  ],
);

export const userUserGroupMemberStatus = pgEnum(
  "user_user_group_member_status",
  ["pending", "member"],
);

export const userUserGroupMember = pgTable(
  "user_user_group_member",
  {
    id: serial("id").primaryKey(),
    groupId: uuid("group_id").notNull(),
    userId: uuid("user_id").notNull(),
    status: userUserGroupMemberStatus("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("user_user_group_member_group_id_idx").on(table.groupId),
    index("user_user_group_member_user_id_idx").on(table.userId),
    uniqueIndex("user_user_group_member_group_id_user_id_idx").on(
      table.groupId,
      table.userId,
    ),
  ],
);

export const eventEvent = pgTable(
  "event_event",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    creatorId: uuid("creator_id").notNull(),
    name: varchar("name", {}),
    description: varchar("description", {}),
    location: varchar("location", {}),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    autoAccept: boolean("auto_accept").notNull(),
    sizeLimit: integer("size_limit").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("event_event_public_id_idx").on(table.publicId),
    index("event_event_creator_id_idx").on(table.creatorId),
  ],
);

export const eventEventMemberStatus = pgEnum("event_event_member_status", [
  "pending",
  "member",
]);

export const eventEventMember = pgTable(
  "event_event_member",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull(),
    userId: uuid("user_id").notNull(),
    status: eventEventMemberStatus("status").notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("event_event_member_event_id_idx").on(table.eventId),
    index("event_event_member_user_id_idx").on(table.userId),
    uniqueIndex("event_event_member_event_id_user_id_idx").on(
      table.eventId,
      table.userId,
    ),
  ],
);

export const chatChat = pgTable(
  "chat_chat",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    groupId: uuid("group_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("chat_chat_public_id_idx").on(table.publicId),
    index("chat_chat_group_id_idx").on(table.groupId),
  ],
);

export const chatChatMessage = pgTable(
  "chat_chat_message",
  {
    id: serial("id").primaryKey(),
    chatId: uuid("chat_id").notNull(),
    senderId: uuid("sender_id").notNull(),
    message: varchar("message", {}),
    imageUrl: varchar("image_url", {}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("chat_chat_message_chat_id_idx").on(table.chatId),
    index("chat_chat_message_sender_id_idx").on(table.senderId),
  ],
);
