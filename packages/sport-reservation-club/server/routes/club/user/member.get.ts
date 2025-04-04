import { EventContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { clubType } from "~/models";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserMemberClubs",
  response: response(
    type({
      clubs: [clubType, "[]"],
    }),
    { stream: false },
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const { access_token: accessToken } = parseCookies(event);

    const { client: oauthClient } = yield* OAuthClient;

    const userId = yield* Effect.flatMap(
      Effect.promise(async () =>
        getSubjectTypeFromToken({
          type: "user",
          client: oauthClient,
          accessToken,
          refreshToken: undefined,
        }),
      ),
      (user) =>
        user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
    );

    const clubRepository = yield* ClubRepository;

    const userClubs = yield* clubRepository.getUserMemberClubs({ userId });

    const uploadClient = yield* UploadClient;

    return {
      clubs: yield* Effect.all(
        userClubs.map(({ club, group, size }) =>
          Effect.gen(function* () {
            const { url: image } = club.image
              ? yield* uploadClient.getDownloadPresignedUrl({
                  query: { key: club.image },
                })
              : { url: undefined };

            const userClient = yield* UserClient;
            const creator = yield* userClient.getUserProfile({
              query: { id: group.creatorId },
            });

            return {
              id: group.publicId,
              creator,
              ...(group.name && { name: group.name }),
              ...(image && { image }),
              ...(club.description && { description: club.description }),
              ...(club.location && { location: club.location }),
              ...(club.locationDescription && {
                locationDescription: club.locationDescription,
              }),
              size,
            };
          }),
        ),
      ),
    };
  }),
);
