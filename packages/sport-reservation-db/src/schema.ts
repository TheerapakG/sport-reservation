import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const authUserAuthConnection = pgTable(
  "auth_user_auth_connection",
  {
    userId: integer("user_id").primaryKey(),
    lineId: varchar("line_id", { length: 64 }).unique(undefined, {
      nulls: "distinct",
    }),
  },
  (_table) => {
    return {};
  },
);

export const userUserProfile = pgTable(
  "user_user_profile",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", {}),
    avatar: varchar("avatar", {}),
  },
  (_table) => {
    return {};
  },
);

export const userUserGroupType = pgEnum("user_user_group_type", [
  "default",
  "friend",
  "event",
  "matching",
  "booking",
]);

export const userUserGroup = pgTable(
  "user_user_group",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", {}),
    creatorId: integer("creator_id").notNull(),
    type: userUserGroupType("type").notNull(),
  },
  (_table) => {
    return {};
  },
);

export const userUserGroupMemberStatus = pgEnum(
  "user_user_group_member_status",
  ["pending", "member"],
);

export const userUserGroupMember = pgTable(
  "user_user_group_member",
  {
    groupId: integer("group_id").notNull(),
    userId: integer("user_id").notNull(),
    status: userUserGroupMemberStatus("status").notNull(),
  },
  (table) => {
    return {
      userUserGroupMemberPk: primaryKey({
        columns: [table.groupId, table.userId],
      }),
    };
  },
);
