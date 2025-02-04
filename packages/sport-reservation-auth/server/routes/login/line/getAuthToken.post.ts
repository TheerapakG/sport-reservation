import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect, Option } from "effect";
import jwt from "jsonwebtoken";
import { UploadClient } from "sport-reservation-upload/client";
import { UserClient } from "sport-reservation-user/client";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { AuthKey } from "~/layers";
import { LineLoginApiRepository } from "~/repositories/lineLoginApiRepository";
import { LineLoginDbRepository } from "~/repositories/lineLoginDbRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postGetLineLoginAuthToken",
  response: noInferOut(
    type({
      token: "string",
    }),
  ),
  body: noInferOut(
    type({
      code: "string",
      state: "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const lineLoginApiRepository = yield* LineLoginApiRepository;
    const lineLoginDbRepository = yield* LineLoginDbRepository;
    const { nonce, id: idToken } = yield* lineLoginApiRepository.getAuthToken({
      code: body.code,
      state: body.state,
    });
    const {
      id: lineId,
      name: lineName,
      avatar: lineAvatar,
    } = yield* lineLoginApiRepository.getProfileByAuthToken({ nonce, idToken });

    const userClient = yield* UserClient;
    const profile = yield* Option.match(
      yield* lineLoginDbRepository.findUserIdByLineId({ lineId }),
      {
        onSome: ({ userId }) =>
          Effect.gen(function* () {
            return yield* userClient.getUserProfileById({
              query: { id: userId },
            });
          }),
        onNone: () =>
          Effect.gen(function* () {
            const uploadClient = yield* UploadClient;
            const partialProfile = yield* userClient.postCreateUserProfile({
              body: { name: lineName },
            });
            const { key: avatarKey } = yield* uploadClient.postUploadFromUrl({
              body: {
                key: `/user/avatar/${partialProfile.id}`,
                url: lineAvatar,
              },
            });
            const profile = yield* userClient.postUpdateUserProfile({
              headers: {
                Authorization: `Bearer ${jwt.sign(
                  partialProfile,
                  authKey.private,
                  {
                    algorithm: "RS256",
                    expiresIn: "7d",
                  },
                )}`,
              },
              body: {
                avatar: avatarKey,
              },
            });
            yield* lineLoginDbRepository.associateUserIdWithLineId({
              userId: profile.id,
              lineId,
            });
            return profile;
          }),
      },
    );

    const authKey = yield* AuthKey;
    const token = yield* Effect.try(() =>
      jwt.sign(profile, authKey.private, {
        algorithm: "RS256",
        expiresIn: "7d",
      }),
    );

    return { token };
  }),
});
