import { index, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const authUserAuthConnection = pgTable(
  "auth_user_auth_connection",
  {
    id: integer("id").primaryKey(),
    lineId: varchar("line_id", { length: 64 }),
  },
  (table) => {
    return {
      lineIdIdx: index("line_id_idx").on(table.lineId),
    };
  },
);
