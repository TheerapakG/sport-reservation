import {
  index,
  pgTable,
  integer,
  unique,
  varchar,
  serial,
} from "drizzle-orm/pg-core";

export const authUserAuthConnection = pgTable(
  "auth_user_auth_connection",
  {
    userId: integer("user_id").primaryKey(),
    lineId: varchar("line_id", { length: 64 }),
  },
  (table) => {
    return {
      lineIdIdx: index("line_id_idx").on(table.lineId),
      lineIdUnq: unique("line_id_unq").on(table.lineId),
    };
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
