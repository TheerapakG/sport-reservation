import { type } from "arktype";
import { Effect, Option } from "effect";
import { effectType } from "sport-reservation-common/utils/effectType";
import { LineLoginRepository } from "~~/repositories/lineLoginRepository.ts";
import { effectEventHandler } from "~~/server/utils/effectEventHandler";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { EventContext } from "sport-reservation-common/utils/effectEventHandler";
import { noInferOut } from "sport-reservation-common/utils/noInfer";
import { UserClient } from "sport-reservation-user";
import { UploadClient } from "sport-reservation-upload";
import { sign } from "jsonwebtoken";

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
    const { event } = yield* EventContext;

    const lineLoginRepository = yield* LineLoginRepository;
    const { code, state } = yield* effectType(
      handlerConfig.body,
      yield* Effect.tryPromise(async () => await readBody(event)),
    );
    const { nonce, id: idToken } = yield* lineLoginRepository.getAuthToken({
      code,
      state,
    });
    const {
      id: lineId,
      name: lineName,
      avatar: lineAvatar,
    } = yield* lineLoginRepository.getProfileByAuthToken({ nonce, idToken });

    const userClient = yield* UserClient;
    const profile = yield* Option.match(
      yield* lineLoginRepository.findUserIdByLineId({ lineId }),
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
            const { id: userId } = yield* userClient.postCreateUserProfile({
              body: { name: lineName },
            });
            const { url: avatar } = yield* uploadClient.postUploadFromUrl({
              body: { key: `/user/avatar/${userId}`, url: lineAvatar },
            });
            const profile = yield* userClient.postUpdateUserProfile({
              body: { id: userId, avatar },
            });
            yield* lineLoginRepository.associateUserIdWithLineId({
              userId,
              lineId,
            });
            return profile;
          }),
      },
    );

    const authKey = yield* AuthKey;
    const token = yield* Effect.try(() =>
      sign(profile, authKey, { algorithm: "RS256" }),
    );

    return { token };
  }),
});
