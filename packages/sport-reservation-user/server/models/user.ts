import { type } from "arktype";

export const userProfileCreate = /*@__PURE__*/ type({
  "name?": "string",
  "avatar?": "string",
});

export const userProfile = /*@__PURE__*/ type({
  id: "string",
  "name?": "string",
  "avatar?": "string",
  "availability?": "string",
  "gender?": "string",
  "birthDate?": "string",
  sports: [
    {
      sportId: "string",
      sportType: "'badminton' | 'tennis' | 'running'",
    },
    "[]",
  ],
  objectives: [
    {
      objectiveId: "string",
      objectiveType:
        "'casual_match' | 'for_fitness' | 'for_fun' | 'love_challenge' | 'love_competition' | 'meet_new_friends' | 'play_to_win' | 'push_limits' | 'relax_rally' | 'self_improvement' | 'serious_play' | 'stay_active'",
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
