import { sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  geometry,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export const authUserEmailConnection = pgTable(
  "auth_user_email_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
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
    index("auth_user_email_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_email_connection_email_idx").on(table.email),
    uniqueIndex("auth_user_email_connection_email_password_idx").on(
      table.email,
      table.passwordHash,
    ),
  ],
);

export const authUserLineConnection = pgTable(
  "auth_user_line_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    lineId: varchar("line_id", { length: 64 }).notNull().unique(),
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
    index("auth_user_line_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_line_connection_line_id_idx").on(table.lineId),
  ],
);

export const authUserGoogleConnection = pgTable(
  "auth_user_google_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    googleId: varchar("google_id", { length: 64 }).notNull().unique(),
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
    index("auth_user_google_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_google_connection_google_id_idx").on(table.googleId),
  ],
);

export const authUserFacebookConnection = pgTable(
  "auth_user_facebook_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    facebookId: varchar("facebook_id", { length: 64 }).notNull(),
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
    index("auth_user_facebook_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_facebook_connection_facebook_id_idx").on(
      table.facebookId,
    ),
  ],
);

export const userUserProfileGender = pgEnum("user_user_profile_gender", [
  "male",
  "female",
  "prefer_not_to_say",
]);

export const userUserProfileMembership = pgEnum(
  "user_user_profile_membership",
  ["free", "plus"],
);

export const userUserProfile = pgTable(
  "user_user_profile",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    name: varchar("name", {}),
    avatar: varchar("avatar", {}),
    availability: varchar("availability", {}),
    gender: userUserProfileGender("gender"),
    membership: userUserProfileMembership("membership")
      .default("free")
      .notNull(),
    birthDate: timestamp("birth_date", { withTimezone: true }),
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

export const userSportType = pgEnum("user_sport_type", [
  "badminton",
  "tennis",
  "running",
]);

export const userSport = pgTable(
  "user_sport",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    sportType: userSportType("sport_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("user_sport_public_id_idx").on(table.publicId)],
);

export const userUserProfileSport = pgTable(
  "user_user_profile_sport",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    sportId: uuid("sport_id").notNull(),
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
    uniqueIndex("user_user_profile_sport_user_id_sport_id_idx").on(
      table.userId,
      table.sportId,
    ),
  ],
);

export const userObjectiveType = pgEnum("user_objective_type", [
  "casual_match",
  "for_fitness",
  "for_fun",
  "love_challenge",
  "love_competition",
  "meet_new_friends",
  "play_to_win",
  "push_limits",
  "relax_rally",
  "self_improvement",
  "serious_play",
  "stay_active",
]);

export const userObjective = pgTable(
  "user_objective",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    objectiveType: userObjectiveType("objective_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("user_objective_public_id_idx").on(table.publicId)],
);

export const userUserProfileObjective = pgTable(
  "user_user_profile_objective",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    objectiveId: uuid("objective_id").notNull(),
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
    uniqueIndex("user_user_profile_objective_user_id_idx").on(
      table.userId,
      table.objectiveId,
    ),
  ],
);

export const userLocation = pgTable(
  "user_location",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    location: geometry("location", { type: "point", srid: 4326 }),
    locationDescription: varchar("location_description", {}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("user_location_public_id_idx").on(table.publicId)],
);

export const userUserProfileLocation = pgTable(
  "user_user_profile_location",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    locationId: uuid("location_id").notNull(),
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
    uniqueIndex("user_user_profile_location_user_id_idx").on(
      table.userId,
      table.locationId,
    ),
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

export const clubClub = pgTable(
  "club_club",
  {
    id: serial("id").primaryKey(),
    groupId: uuid("group_id").notNull(),
    image: varchar("image", {}),
    description: varchar("description", {}),
    location: geometry("location", { type: "point", srid: 4326 }),
    locationDescription: varchar("location_description", {}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("user_club_group_id_idx").on(table.groupId)],
);

export const eventEventCreatorType = pgEnum("event_event_creator_type", [
  "user",
  "club",
]);

export const eventSportType = pgEnum("event_sport_type", [
  "badminton",
  "tennis",
  "running",
]);

export const eventSkillLevel = pgEnum("event_skill_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const eventEvent = pgTable(
  "event_event",
  {
    id: serial("id").primaryKey(),
    groupId: uuid("group_id").notNull(),
    image: varchar("image", {}),
    eventCreatorType: eventEventCreatorType("event_creator_type").notNull(),
    creatorId: uuid("creator_id").notNull(),
    description: varchar("description", {}),
    location: geometry("location", { type: "point", srid: 4326 }),
    locationDescription: varchar("location_description", {}),
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
    index("event_event_group_id_idx").on(table.groupId),
    index("event_event_creator_id_idx").on(table.creatorId),
  ],
);

export const eventEventSkillLevel = pgTable(
  "event_event_skill_level",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull(),
    skillLevel: eventSkillLevel("skill_level").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("event_event_skill_level_event_id_idx").on(table.eventId)],
);

export const eventEventSport = pgTable(
  "event_event_sport",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull(),
    sportType: eventSportType("sport_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => sql`(now() AT TIME ZONE 'utc'::text)`),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("event_event_sport_event_id_idx").on(table.eventId)],
);

export const eventEventSchedule = pgTable(
  "event_event_schedule",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    eventId: uuid("event_id").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    repeat: integer("repeat").notNull(),
    repeatInterval: integer("repeat_interval").notNull(),
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
    index("event_event_schedule_event_id_idx").on(table.eventId),
    uniqueIndex("event_event_schedule_public_id_idx").on(table.publicId),
  ],
);

export const eventScheduleMember = pgTable(
  "event_schedule_member",
  {
    id: serial("id").primaryKey(),
    scheduleId: uuid("schedule_id").notNull(),
    repeatIndex: integer("repeat_index").notNull(),
    userId: uuid("user_id").notNull(),
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
    index("event_schedule_member_schedule_id_idx").on(table.scheduleId),
    index("event_schedule_member_user_id_idx").on(table.userId),
    uniqueIndex("event_schedule_member_schedule_id_user_id_idx").on(
      table.scheduleId,
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
    publicId: uuid("public_id").defaultRandom().notNull(),
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
    uniqueIndex("chat_chat_message_public_id_idx").on(table.publicId),
    index("chat_chat_message_chat_id_idx").on(table.chatId),
    index("chat_chat_message_chat_id_created_at_idx").on(
      table.chatId,
      table.createdAt.desc(),
    ),
  ],
);

export const chatChatSubscription = pgTable(
  "chat_chat_subscription",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    userId: uuid("user_id").notNull(),
    partition: integer("partition").notNull(),
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
    uniqueIndex("chat_chat_subscription_public_id_idx").on(table.publicId),
    index("chat_chat_subscription_user_id_idx").on(table.userId),
  ],
);

export const matchingUserGeneralAssessment = pgTable(
  "matching_user_general_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
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
    uniqueIndex("matching_user_general_assessment_user_id_idx").on(
      table.userId,
      table.assessmentVersion,
    ),
  ],
);

export const matchingUserBadmintonAssessment = pgTable(
  "matching_user_badminton_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
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
    uniqueIndex("matching_user_badminton_assessment_user_id_idx").on(
      table.userId,
      table.assessmentVersion,
    ),
  ],
);

export const matchingUserTennisAssessment = pgTable(
  "matching_user_tennis_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
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
    uniqueIndex("matching_user_tennis_assessment_user_id_idx").on(
      table.userId,
      table.assessmentVersion,
    ),
  ],
);

export const matchingUserRunningAssessment = pgTable(
  "matching_user_running_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
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
    uniqueIndex("matching_user_running_assessment_user_id_idx").on(
      table.userId,
      table.assessmentVersion,
    ),
  ],
);

export const VECTOR_PARTITIONS = {
  GENERAL: [1, 16],
  BADMINTON: [17, 16],
  TENNIS: [33, 16],
  RUNNING: [49, 16],
};

export const matchingUserAssessmentVector = pgTable(
  "matching_user_assessment_vector",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    vectorVersion: vector("vector_version", {
      dimensions: 16,
    }).notNull(),
    passiveMatchingVector: vector("passive_matching_vector", {
      dimensions: 256,
    }).notNull(),
    activeMatchingVector: vector("active_matching_vector", {
      dimensions: 256,
    }).notNull(),
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
    uniqueIndex("matching_user_assessment_user_id_idx").on(table.userId),
  ],
);

export const matchingCursor = pgTable(
  "matching_cursor",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    userId: uuid("user_id").notNull(),
    vectorVersion: vector("vector_version", {
      dimensions: 16,
    }).notNull(),
    vector: vector("vector", {
      dimensions: 256,
    }).notNull(),
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
    uniqueIndex("matching_cursor_public_id_idx").on(table.publicId),
    index("matching_cursor_user_id_idx").on(table.userId),
  ],
);

export const matchingCursorMatches = pgTable(
  "matching_cursor_matches",
  {
    id: serial("id").primaryKey(),
    cursorId: uuid("cursor_id").notNull(),
    userId: uuid("user_id").notNull(),
    distance: doublePrecision("distance").notNull(),
    minDistance: doublePrecision("min_distance").notNull(),
    maxDistance: doublePrecision("max_distance").notNull(),
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
    uniqueIndex("matching_cursor_matches_cursor_id_user_id_idx").on(
      table.cursorId,
      table.userId,
    ),
  ],
);
