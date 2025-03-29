import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option } from "effect";
import { getHeader } from "h3";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { userProfile } from "~/models/user";
import { AuthRepository } from "~/repositories/authRepository";
import { LocationRepository } from "~/repositories/locationRepository";
import { ObjectiveRepository } from "~/repositories/objectiveRepository";
import { SportRepository } from "~/repositories/sportRepository";
import { UserRepository } from "~/repositories/userRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserProfiles",
  response: response(type([[userProfile, "|", "undefined"], "[]"]), {
    stream: false,
  }),
  query: params(
    type({
      ids: "string[]",
    }),
  ),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { query },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const authRepository = yield* AuthRepository;
    yield* authRepository.checkSecret({
      secret: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
    });

    const userRepository = yield* UserRepository;
    const profiles = yield* userRepository.findUserProfileByIds({
      publicIds: query.ids,
    });

    const extendedProfiles = yield* Effect.all(
      profiles.map((profile) =>
        Option.match(profile, {
          onSome: (profile) =>
            Effect.gen(function* () {
              const uploadClient = yield* UploadClient;
              const { url: avatar } = profile.avatar
                ? yield* uploadClient.getDownloadPresignedUrl({
                    query: { key: profile.avatar },
                  })
                : { url: undefined };

              const [sports, objectives, locations] = yield* Effect.all([
                Effect.gen(function* () {
                  const sportRepository = yield* SportRepository;
                  return yield* sportRepository.getSportsByUserId({
                    userId: profile.publicId,
                  });
                }),
                Effect.gen(function* () {
                  const objectiveRepository = yield* ObjectiveRepository;
                  return yield* objectiveRepository.getObjectivesByUserId({
                    userId: profile.publicId,
                  });
                }),
                Effect.gen(function* () {
                  const locationRepository = yield* LocationRepository;
                  return yield* locationRepository.getLocationsByUserId({
                    userId: profile.publicId,
                  });
                }),
              ]);

              return Option.some({
                profile,
                avatar,
                sports,
                objectives,
                locations,
              });
            }),
          onNone: () => Effect.succeed(Option.none()),
        }),
      ),
    );

    return extendedProfiles.map((profile) =>
      Option.match(profile, {
        onSome: ({ profile, avatar, sports, objectives, locations }) => ({
          id: profile.publicId,
          ...(profile.name ? { name: profile.name } : {}),
          ...(avatar ? { avatar } : {}),
          ...(profile.availability
            ? { availability: profile.availability }
            : {}),
          ...(profile.gender ? { gender: profile.gender } : {}),
          ...(profile.birthDate
            ? { birthDate: profile.birthDate.toISOString() }
            : {}),
          sports: sports.map((sport) => ({
            sportId: sport.sport.publicId,
            sportType: sport.sport.sportType,
          })),
          objectives: objectives.map((objective) => ({
            objectiveId: objective.objective.publicId,
            objectiveType: objective.objective.objectiveType,
          })),
          locations: locations.map((location) => ({
            locationId: location.location.publicId,
            ...(location.location.location
              ? { location: location.location.location }
              : {}),
            ...(location.location.locationDescription
              ? { locationDescription: location.location.locationDescription }
              : {}),
          })),
        }),
        onNone: () => undefined,
      }),
    );
  }),
);
