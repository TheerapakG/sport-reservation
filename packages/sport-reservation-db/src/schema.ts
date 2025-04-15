import { relations } from "drizzle-orm";
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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
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

export const authUserEmailConnectionRelations = relations(
  authUserEmailConnection,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [authUserEmailConnection.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const authUserLineConnection = pgTable(
  "auth_user_line_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    lineId: varchar("line_id", { length: 64 }).notNull().unique(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("auth_user_line_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_line_connection_line_id_idx").on(table.lineId),
  ],
);

export const authUserLineConnectionRelations = relations(
  authUserLineConnection,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [authUserLineConnection.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const authUserGoogleConnection = pgTable(
  "auth_user_google_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    googleId: varchar("google_id", { length: 64 }).notNull().unique(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("auth_user_google_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_google_connection_google_id_idx").on(table.googleId),
  ],
);

export const authUserGoogleConnectionRelations = relations(
  authUserGoogleConnection,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [authUserGoogleConnection.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const authUserFacebookConnection = pgTable(
  "auth_user_facebook_connection",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    facebookId: varchar("facebook_id", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("auth_user_facebook_connection_user_id_idx").on(table.userId),
    uniqueIndex("auth_user_facebook_connection_facebook_id_idx").on(
      table.facebookId,
    ),
  ],
);

export const authUserFacebookConnectionRelations = relations(
  authUserFacebookConnection,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [authUserFacebookConnection.userId],
      references: [userUserProfile.publicId],
    }),
  }),
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
    birthDate: timestamp("birth_date", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("user_user_profile_public_id_idx").on(table.publicId),
  ],
);

export const userUserProfileRelations = relations(
  userUserProfile,
  ({ many }) => ({
    authUserEmailConnection: many(authUserEmailConnection),
    authUserLineConnection: many(authUserLineConnection),
    authUserGoogleConnection: many(authUserGoogleConnection),
    authUserFacebookConnection: many(authUserFacebookConnection),
    userUserProfileSport: many(userUserProfileSport),
    userUserProfileObjective: many(userUserProfileObjective),
    userUserProfileLocation: many(userUserProfileLocation),
    userUserGroupMember: many(userUserGroupMember),
    userUserGroup: many(userUserGroup),
    eventEvent: many(eventEvent),
  }),
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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [uniqueIndex("user_sport_public_id_idx").on(table.publicId)],
);

export const userSportRelations = relations(userSport, ({ many }) => ({
  userUserProfileSport: many(userUserProfileSport),
}));

export const userUserProfileSport = pgTable(
  "user_user_profile_sport",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    sportId: uuid("sport_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("user_user_profile_sport_user_id_sport_id_idx").on(
      table.userId,
      table.sportId,
    ),
  ],
);

export const userUserProfileSportRelations = relations(
  userUserProfileSport,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [userUserProfileSport.userId],
      references: [userUserProfile.publicId],
    }),
    sport: one(userSport, {
      fields: [userUserProfileSport.sportId],
      references: [userSport.publicId],
    }),
  }),
);

export const userObjectiveType = pgEnum("user_objective_type", [
  // casual
  "just_for_fun",
  "easygoing_games",
  "good_vibes_only",
  "no_pressure_just_play",
  "here_to_enjoy",
  "relax_rally",
  "casual_matches",
  // competitive
  "train_improve",
  "bring_the_heat",
  "love_a_tough_match",
  "lets_push_limits",
  "winning_mindset",
  "serious_play",
  "always_leveling_up",
  // fitness
  "stay_fit_have_fun",
  "game_workout",
  "cardio_with_a_racket",
  "move_groove",
  "sweat_play",
  "sports_my_gym",
  // social
  "meet_new_friends",
  "social_sporty",
  "looking_for_teammates",
  "here_to_connect",
  "sports_smiles",
  "join_my_club",
  "game_chill",
  "flexible_open_to_anything",
  "casual_or_serious",
  "down_for_anything",
  "lets_just_play",
  "depends_on_the_day",
  "mix_of_fun_competition",
]);

export const userObjectiveCategoryType = pgEnum(
  "user_objective_category_type",
  ["casual", "competitive", "fitness", "social"],
);

export const userObjectiveCategory = pgTable(
  "user_objective_category",
  {
    id: serial("id").primaryKey(),
    objectiveType: userObjectiveType("objective_type").notNull(),
    categoryType: userObjectiveCategoryType("category_type").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("user_objective_category_objective_type_idx").on(table.objectiveType),
  ],
);

export const userObjectiveCategoryRelations = relations(
  userObjectiveCategory,
  ({ many }) => ({
    userObjective: many(userObjective),
  }),
);

export const userObjective = pgTable(
  "user_objective",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    objectiveType: userObjectiveType("objective_type").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [uniqueIndex("user_objective_public_id_idx").on(table.publicId)],
);

export const userObjectiveRelations = relations(userObjective, ({ many }) => ({
  userUserProfileObjective: many(userUserProfileObjective),
  userObjectiveCategory: many(userObjectiveCategory),
}));

export const userUserProfileObjective = pgTable(
  "user_user_profile_objective",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    objectiveId: uuid("objective_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("user_user_profile_objective_user_id_idx").on(
      table.userId,
      table.objectiveId,
    ),
  ],
);

export const userUserProfileObjectiveRelations = relations(
  userUserProfileObjective,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [userUserProfileObjective.userId],
      references: [userUserProfile.publicId],
    }),
    objective: one(userObjective, {
      fields: [userUserProfileObjective.objectiveId],
      references: [userObjective.publicId],
    }),
  }),
);

export const userLocation = pgTable(
  "user_location",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    location: geometry("location", { type: "point", srid: 4326 }),
    locationDescription: varchar("location_description", {}),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [uniqueIndex("user_location_public_id_idx").on(table.publicId)],
);

export const userLocationRelations = relations(userLocation, ({ many }) => ({
  userUserProfileLocation: many(userUserProfileLocation),
}));

export const userUserProfileLocation = pgTable(
  "user_user_profile_location",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    locationId: uuid("location_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("user_user_profile_location_user_id_idx").on(
      table.userId,
      table.locationId,
    ),
  ],
);

export const userUserProfileLocationRelations = relations(
  userUserProfileLocation,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [userUserProfileLocation.userId],
      references: [userUserProfile.publicId],
    }),
    location: one(userLocation, {
      fields: [userUserProfileLocation.locationId],
      references: [userLocation.publicId],
    }),
  }),
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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("user_user_group_public_id_idx").on(table.publicId),
    index("user_user_group_creator_id_idx").on(table.creatorId),
  ],
);

export const userUserGroupRelations = relations(
  userUserGroup,
  ({ one, many }) => ({
    clubClub: one(clubClub),
    eventEvent: one(eventEvent),
    userUserGroupMember: many(userUserGroupMember),
  }),
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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
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

export const userUserGroupMemberRelations = relations(
  userUserGroupMember,
  ({ one }) => ({
    userUserGroup: one(userUserGroup, {
      fields: [userUserGroupMember.groupId],
      references: [userUserGroup.publicId],
    }),
    user: one(userUserProfile, {
      fields: [userUserGroupMember.userId],
      references: [userUserProfile.publicId],
    }),
  }),
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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [index("user_club_group_id_idx").on(table.groupId)],
);

export const clubClubRelations = relations(clubClub, ({ one, many }) => ({
  userUserGroup: many(userUserGroup),
  userUserProfile: one(userUserProfile),
  eventEvent: many(eventEvent),
}));

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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("event_event_group_id_idx").on(table.groupId),
    index("event_event_creator_id_idx").on(table.creatorId),
  ],
);

export const eventEventRelations = relations(eventEvent, ({ many, one }) => ({
  eventEventSkillLevel: many(eventEventSkillLevel),
  eventEventSport: many(eventEventSport),
  eventEventSchedule: many(eventEventSchedule),
  clubClub: one(clubClub, {
    fields: [eventEvent.creatorId],
    references: [clubClub.groupId],
  }),
  userUserGroup: many(userUserGroup),
}));

export const eventEventSkillLevel = pgTable(
  "event_event_skill_level",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull(),
    skillLevel: eventSkillLevel("skill_level").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [index("event_event_skill_level_event_id_idx").on(table.eventId)],
);

export const eventEventSkillLevelRelations = relations(
  eventEventSkillLevel,
  ({ one }) => ({
    event: one(eventEvent, {
      fields: [eventEventSkillLevel.eventId],
      references: [eventEvent.groupId],
    }),
  }),
);

export const eventEventSport = pgTable(
  "event_event_sport",
  {
    id: serial("id").primaryKey(),
    eventId: uuid("event_id").notNull(),
    sportType: eventSportType("sport_type").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [index("event_event_sport_event_id_idx").on(table.eventId)],
);

export const eventEventSportRelations = relations(
  eventEventSport,
  ({ one }) => ({
    event: one(eventEvent, {
      fields: [eventEventSport.eventId],
      references: [eventEvent.groupId],
    }),
  }),
);

export const eventEventSchedule = pgTable(
  "event_event_schedule",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    eventId: uuid("event_id").notNull(),
    startAt: timestamp("start_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    endAt: timestamp("end_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    repeat: integer("repeat").notNull(),
    repeatInterval: integer("repeat_interval").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("event_event_schedule_event_id_idx").on(table.eventId),
    uniqueIndex("event_event_schedule_public_id_idx").on(table.publicId),
  ],
);

export const eventEventScheduleRelations = relations(
  eventEventSchedule,
  ({ one }) => ({
    event: one(eventEvent, {
      fields: [eventEventSchedule.eventId],
      references: [eventEvent.groupId],
    }),
  }),
);

export const eventScheduleMember = pgTable(
  "event_schedule_member",
  {
    id: serial("id").primaryKey(),
    scheduleId: uuid("schedule_id").notNull(),
    repeatIndex: integer("repeat_index").notNull(),
    userId: uuid("user_id").notNull(),
    size: integer("size").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
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

export const eventScheduleMemberRelations = relations(
  eventScheduleMember,
  ({ one }) => ({
    eventSchedule: one(eventEventSchedule, {
      fields: [eventScheduleMember.scheduleId],
      references: [eventEventSchedule.publicId],
    }),
    user: one(userUserProfile, {
      fields: [eventScheduleMember.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const chatChat = pgTable(
  "chat_chat",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    groupId: uuid("group_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("chat_chat_public_id_idx").on(table.publicId),
    index("chat_chat_group_id_idx").on(table.groupId),
  ],
);

export const chatChatRelations = relations(chatChat, ({ many }) => ({
  chatChatMessage: many(chatChatMessage),
}));

export const chatChatMessage = pgTable(
  "chat_chat_message",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    chatId: uuid("chat_id").notNull(),
    senderId: uuid("sender_id").notNull(),
    message: varchar("message", {}),
    imageUrl: varchar("image_url", {}),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
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

export const chatChatMessageRelations = relations(
  chatChatMessage,
  ({ one }) => ({
    chat: one(chatChat, {
      fields: [chatChatMessage.chatId],
      references: [chatChat.publicId],
    }),
    sender: one(userUserProfile, {
      fields: [chatChatMessage.senderId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const chatChatSubscription = pgTable(
  "chat_chat_subscription",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    userId: uuid("user_id").notNull(),
    partition: integer("partition").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("chat_chat_subscription_public_id_idx").on(table.publicId),
    index("chat_chat_subscription_user_id_idx").on(table.userId),
  ],
);

export const chatChatSubscriptionRelations = relations(
  chatChatSubscription,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [chatChatSubscription.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const matchingUserGeneralAssessment = pgTable(
  "matching_user_general_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
);

export const matchingUserGeneralAssessmentRelations = relations(
  matchingUserGeneralAssessment,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [matchingUserGeneralAssessment.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const matchingUserBadmintonAssessment = pgTable(
  "matching_user_badminton_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
);

export const matchingUserBadmintonAssessmentRelations = relations(
  matchingUserBadmintonAssessment,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [matchingUserBadmintonAssessment.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const matchingUserTennisAssessment = pgTable(
  "matching_user_tennis_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
);

export const matchingUserTennisAssessmentRelations = relations(
  matchingUserTennisAssessment,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [matchingUserTennisAssessment.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const matchingUserRunningAssessment = pgTable(
  "matching_user_running_assessment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assessmentVersion: integer("assessment_version"),
    assessment: jsonb("assessment"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
);

export const matchingUserRunningAssessmentRelations = relations(
  matchingUserRunningAssessment,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [matchingUserRunningAssessment.userId],
      references: [userUserProfile.publicId],
    }),
  }),
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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("matching_user_assessment_user_id_idx").on(table.userId),
  ],
);

export const matchingUserAssessmentVectorRelations = relations(
  matchingUserAssessmentVector,
  ({ one }) => ({
    user: one(userUserProfile, {
      fields: [matchingUserAssessmentVector.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);

export const matchingCursor = pgTable(
  "matching_cursor",
  {
    id: serial("id").primaryKey(),
    publicId: uuid("public_id").defaultRandom().notNull(),
    userId: uuid("user_id").notNull(),
    minAge: integer("min_age"),
    maxAge: integer("max_age"),
    vectorVersion: vector("vector_version", {
      dimensions: 16,
    }).notNull(),
    vector: vector("vector", {
      dimensions: 256,
    }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("matching_cursor_public_id_idx").on(table.publicId),
    index("matching_cursor_user_id_idx").on(table.userId),
  ],
);

export const matchingCursorRelations = relations(
  matchingCursor,
  ({ one, many }) => ({
    user: one(userUserProfile, {
      fields: [matchingCursor.userId],
      references: [userUserProfile.publicId],
    }),
    cursorObjectiveCategories: many(matchingCursorObjectiveCategory),
    cursorMatches: many(matchingCursorMatches),
  }),
);

export const matchingCursorGender = pgTable(
  "matching_cursor_gender",
  {
    id: serial("id").primaryKey(),
    cursorId: uuid("cursor_id").notNull(),
    gender: userUserProfileGender("gender").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("matching_cursor_gender_cursor_id_gender_idx").on(
      table.cursorId,
      table.gender,
    ),
  ],
);

export const matchingCursorGenderRelations = relations(
  matchingCursorGender,
  ({ one }) => ({
    cursor: one(matchingCursor, {
      fields: [matchingCursorGender.cursorId],
      references: [matchingCursor.publicId],
    }),
  }),
);

export const matchingCursorObjectiveCategory = pgTable(
  "matching_cursor_objective_category",
  {
    id: serial("id").primaryKey(),
    cursorId: uuid("cursor_id").notNull(),
    objectiveCategory:
      userObjectiveCategoryType("objective_category").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex(
      "matching_cursor_objective_category_cursor_id_objective_category_idx",
    ).on(table.cursorId, table.objectiveCategory),
  ],
);

export const matchingCursorObjectiveCategoryRelations = relations(
  matchingCursorObjectiveCategory,
  ({ one }) => ({
    cursor: one(matchingCursor, {
      fields: [matchingCursorObjectiveCategory.cursorId],
      references: [matchingCursor.publicId],
    }),
  }),
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
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("matching_cursor_matches_cursor_id_user_id_idx").on(
      table.cursorId,
      table.userId,
    ),
  ],
);

export const matchingCursorMatchesRelations = relations(
  matchingCursorMatches,
  ({ one }) => ({
    cursor: one(matchingCursor, {
      fields: [matchingCursorMatches.cursorId],
      references: [matchingCursor.publicId],
    }),
    user: one(userUserProfile, {
      fields: [matchingCursorMatches.userId],
      references: [userUserProfile.publicId],
    }),
  }),
);
