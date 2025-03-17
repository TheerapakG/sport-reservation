import { type } from "arktype";

export const generalAssessmentSchemas = {
  1: type({
    vigorousDays: "number",
    vigorousMinutes: "number",
    moderateDays: "number",
    moderateMinutes: "number",
    walkDays: "number",
    walkMinutes: "number",
  }),
};

export const badmintonAssessmentSchemas = {
  1: type({
    skillLevel: "number",
    yearsOfExperience: "number",
    playStyle: "'offensive' | 'defensive' | 'balanced'",
    playFormat: "'singles' | 'doubles' | 'mixed'",
    playDuration: "number",
  }),
};

export const tennisAssessmentSchemas = {
  1: type({
    skillLevel: "number",
    yearsOfExperience: "number",
    strokeStyle: "'forehand' | 'backhand' | 'volley' | 'serve'",
    playFormat: "'singles' | 'doubles' | 'mixed'",
    playDuration: "number",
  }),
};

export const runningAssessmentSchemas = {
  1: type({
    distance: "number",
    pace: "number",
    frequency: "number",
    goal: "('casual' | 'race_training' | 'speed_training' | 'social')[]",
    bestPerformance: {
      distance: "number",
      time: "number",
    },
  }),
};
