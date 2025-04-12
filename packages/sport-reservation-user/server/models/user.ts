import { type } from "arktype";

export const userProfileCreate = /*@__PURE__*/ type({
  "name?": "string",
  "avatar?": "string",
});

export const sportType = type("'badminton' | 'tennis' | 'running'");
export const objectiveType = type.enumerated(
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
);

export const userProfile = /*@__PURE__*/ type({
  id: "string",
  "name?": "string",
  "avatar?": "string",
  "availability?": "string",
  "gender?": "string",
  "birthDate?": "string",
  membership: "'free' | 'plus'",
  sports: [
    {
      sportId: "string",
      sportType,
    },
    "[]",
  ],
  objectives: [
    {
      objectiveId: "string",
      objectiveType,
    },
    "[]",
  ],
  locations: [
    {
      locationId: "string",
      "location?": ["number", "number"],
      "locationDescription?": "string",
    },
    "[]",
  ],
});
