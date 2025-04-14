import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, pipe } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { badmintonAssessmentSchemas } from "~/models/assessment";
import { AssessmentDbRepository } from "~/repositories/assessmentDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "createBadmintonAssessmentV1",
  response: response(type({ success: "boolean" }), { stream: false }),
  body: params(badmintonAssessmentSchemas[1]),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);

    const userId = yield* pipe(
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
    );

    const assessmentDbRepository = yield* AssessmentDbRepository;
    yield* assessmentDbRepository.createBadmintonV1Assessment(userId, body);

    return {
      success: true,
    };
  }),
);
