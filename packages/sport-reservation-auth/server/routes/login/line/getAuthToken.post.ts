import { type } from "arktype";
import { Effect, Option } from "effect";
import { LineLoginRepository } from "~/repositories/lineLoginRepository";
import { effectEventHandler } from "~/utils/effectEventHandler";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { EventParamsContext } from "sport-reservation-common/utils/effectEventHandler";
import { noInferOut } from "sport-reservation-common/utils/noInfer";
import { UserClient } from "sport-reservation-user";
import { UploadClient } from "sport-reservation-upload";
import jwt from "jsonwebtoken";
import { AuthKey } from "~/layers";

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

    const lineLoginRepository = yield* LineLoginRepository;
    const { nonce, id: idToken } = yield* lineLoginRepository.getAuthToken({
      code: body.code,
      state: body.state,
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
      jwt.sign(profile, authKey, { algorithm: "RS256" }),
    );

    return { token };
  }),
});
