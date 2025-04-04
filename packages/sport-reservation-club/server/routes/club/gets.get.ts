import { effectEventHandler, EventParamsContext } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { clubType } from "~/models";
import { ClubRepository } from "~/repositories/clubRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getClubs",
  response: response(
    type({
      clubs: [[clubType, "|", "undefined"], "[]"],
    }),
    {
      stream: false,
    },
  ),
  query: params(
    type({
      clubIds: "string[]",
    }),
  ),
});

export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { clubIds },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const clubRepository = yield* ClubRepository;
    const clubs = yield* clubRepository.getClubsByIds({
      clubIds,
    });

    const extendedClubs = yield* Effect.all(
      clubs.map((club) =>
        Option.match(club, {
          onSome: (club) =>
            Effect.gen(function* () {
              const uploadClient = yield* UploadClient;
              const { url: image } = club.club.image
                ? yield* uploadClient.getDownloadPresignedUrl({
                    query: { key: club.club.image },
                  })
                : { url: undefined };

              const userClient = yield* UserClient;
              const creator = yield* userClient.getUserProfile({
                query: { id: club.group.creatorId },
              });

              return Option.some({
                club,
                image,
                creator,
              });
            }),
          onNone: () => Effect.succeed(Option.none()),
        }),
      ),
    );

    return {
      clubs: extendedClubs.map((club) =>
        Option.match(club, {
          onSome: ({ club, image, creator }) => ({
            id: club.group.publicId,
            creator,
            ...(club.group.name ? { name: club.group.name } : {}),
            ...(image ? { image } : {}),
            ...(club.club.description
              ? { description: club.club.description }
              : {}),
            ...(club.club.location ? { location: club.club.location } : {}),
            ...(club.club.locationDescription
              ? { locationDescription: club.club.locationDescription }
              : {}),
            size: club.size,
          }),
          onNone: () => undefined,
        }),
      ),
    };
  }),
);
