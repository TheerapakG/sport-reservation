import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { runningAssessmentSchemas } from "~/models"; // Changed import
import { AssessmentDbRepository } from "~/repositories/assessmentDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getRunningAssessmentV1List", // Changed name
  response: response(
    type({ assessments: [runningAssessmentSchemas[1], "[]"] }), // Changed schema
    {
      stream: false,
    },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  pipe(
    Effect.Do,
    Effect.bindAll(() => ({
      oauthClient: pipe(
        OAuthClient,
        Effect.map(({ client }) => client),
      ),
      event: pipe(
        EventContext,
        Effect.map(({ event }) => event),
      ),
      assessmentDbRepository: AssessmentDbRepository,
    })),
    Effect.let("accessToken", ({ event }) => parseCookies(event).access_token),
    Effect.bind("userId", ({ oauthClient, accessToken }) =>
      pipe(
        Effect.promise(() =>
          getSubjectTypeFromToken({
            type: "user",
            client: oauthClient,
            accessToken,
            refreshToken: undefined,
          }),
        ),
        Effect.flatMap((user) =>
          user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
        ),
      ),
    ),
    Effect.bind(
      "assessments",
      ({ assessmentDbRepository, userId }) =>
        assessmentDbRepository.getRunningAssessmentV1Performed(userId), // Changed method call
    ),
    Effect.map(({ assessments }) => ({ assessments: [...assessments] })),
  ),
);
