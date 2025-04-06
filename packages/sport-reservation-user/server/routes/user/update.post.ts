import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option, pipe } from "effect";
import { getHeader, parseCookies } from "h3";
import { getSubjectTypeFromToken } from "sport-reservation-oauth-common/subjects";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { OAuthError } from "tiara-stack/models/errors";
import { OAuthClient } from "~/layers";
import { userProfile } from "~/models/user";
import { AuthRepository } from "~/repositories/authRepository";
import { LocationRepository } from "~/repositories/locationRepository";
import { ObjectiveRepository } from "~/repositories/objectiveRepository";
import { SportRepository } from "~/repositories/sportRepository";
import { UserRepository } from "~/repositories/userRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postUpdateUserProfile",
  response: response(userProfile, { stream: false }),
  body: params(
    type({
      "id?": "string",
      "name?": "string",
      "avatar?": "string",
      "availability?": "string",
      "gender?": "'male' | 'female' | 'prefer_not_to_say'",
      "birthDate?": "string.date.parse",
    }),
  ),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const id = yield* pipe(
      Option.fromNullable(body.id),
      Option.match({
        onSome: (id) =>
          Effect.gen(function* () {
            const authRepository = yield* AuthRepository;
            yield* authRepository.checkSecret({
              secret: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
            });
            return id;
          }),
        onNone: () =>
          pipe(
            Effect.gen(function* () {
              const { client: oauthClient } = yield* OAuthClient;
              const { access_token: accessToken } = parseCookies(event);
              return yield* Effect.promise(() =>
                getSubjectTypeFromToken({
                  type: "user",
                  client: oauthClient,
                  accessToken,
                  refreshToken: undefined,
                }),
              );
            }),
            Effect.flatMap((user) =>
              user ? Effect.succeed(user.id) : Effect.fail(new OAuthError()),
            ),
          ),
      }),
    );

    const userRepository = yield* UserRepository;
    const profile = yield* yield* userRepository.updateUserProfile({
      publicId: id,
      name: body.name,
      avatar: body.avatar,
      gender: body.gender,
      birthDate: body.birthDate,
    });

    const uploadClient = yield* UploadClient;
    const { url: avatar } = profile.avatar
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: profile.avatar },
        })
      : {
          url: undefined,
        };

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

    return {
      id: profile.publicId,
      ...(profile.name ? { name: profile.name } : {}),
      ...(avatar ? { avatar } : {}),
      ...(profile.availability ? { availability: profile.availability } : {}),
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
    };
  }),
);
