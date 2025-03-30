import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateClubEvent",
  response: response(type({ eventId: "string" }), { stream: false }),
  body: params(
    type({
      clubId: "string",
      name: "string",
      description: "string",
      location: ["number", "number"],
      locationDescription: "string",
      autoAccept: "boolean",
      sizeLimit: "number",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);
    const {
      params: {
        body: {
          clubId,
          name,
          description,
          location,
          locationDescription,
          autoAccept,
          sizeLimit,
        },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const { client: oauthClient } = yield* OAuthClient;

    // Verify user authentication
    yield* Effect.flatMap(
      Effect.promise(async () =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      ),
      (user) => (user ? Effect.succeed(user) : Effect.fail(new OAuthError())),
    );

    // Create event for the club
    const eventRepository = yield* EventRepository;
    const resultOption = yield* eventRepository.createEventByClub({
      clubId,
      name,
      description,
      location,
      locationDescription,
      autoAccept,
      sizeLimit,
    });

    // Handle the Option result
    return yield* Option.match(resultOption, {
      onNone: () => Effect.fail(new Error("Failed to create event for club")),
      onSome: (result) => Effect.succeed(result),
    });
  }),
);
