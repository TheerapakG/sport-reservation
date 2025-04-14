import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { badmintonAssessmentSchemas } from "~/models";
import { AssessmentDbRepository } from "~/repositories/assessmentDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getBadmintonAssessmentV1List",
  response: response(
    type({ assessments: [badmintonAssessmentSchemas[1], "[]"] }),
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
    Effect.bind("assessments", ({ assessmentDbRepository, userId }) =>
      assessmentDbRepository.getBadmintonAssessmentV1Performed(userId),
    ),
    Effect.map(({ assessments }) => ({ assessments: [...assessments] })),
  ),
);
