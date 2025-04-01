import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { EventRepository } from "~/repositories/eventRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserCreatedEvents",
  response: response(
    type([
      {
        eventId: "string",
        "name?": "string",
        "image?": "string",
        "description?": "string",
        "locationDescription?": "string",
        autoAccept: "boolean",
        sizeLimit: "number",
        skillLevel: "('beginner' | 'intermediate' | 'advanced')[]",
        sportType: "('badminton' | 'tennis' | 'running')[]",
      },
      "[]",
    ]),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);

    const { client: oauthClient } = yield* OAuthClient;

    const user = yield* Effect.flatMap(
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

    const eventRepository = yield* EventRepository;
    const events = yield* eventRepository.getUserCreatedEvents({
      userId: user.id,
    });

    const uploadClient = yield* UploadClient;

    return yield* Effect.forEach(
      events,
      ({ event, group, skillLevel, sportType }) =>
        Effect.gen(function* () {
          const { url: image } = event.image
            ? yield* uploadClient.getDownloadPresignedUrl({
                query: { key: event.image },
              })
            : { url: undefined };

          return {
            eventId: group.publicId,
            ...(group.name && { name: group.name }),
            ...(image && { image }),
            ...(event.description && { description: event.description }),
            ...(event.locationDescription && {
              locationDescription: event.locationDescription,
            }),
            autoAccept: event.autoAccept,
            sizeLimit: event.sizeLimit,
            skillLevel: skillLevel.map((sl) => sl.skillLevel),
            sportType: sportType.map((st) => st.sportType),
          };
        }),
    );
  }),
);
