import { type } from "arktype";
import { Effect } from "effect";
import { EventParamsContext } from "sport-reservation-common/utils/effectEventHandler";
import { defineEventHandlerConfig } from "sport-reservation-common/utils/eventHandlerConfig";
import { noInferOut } from "sport-reservation-common/utils/noInfer";
import { UploadClient } from "sport-reservation-upload/client";
import { userProfile } from "~/models/user";
import { UserRepository } from "~/repositories/userRepository";
import { effectEventHandler } from "~/utils/effectEventHandler";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserProfileById",
  response: userProfile,
  query: noInferOut(
    type({
      id: "number.integer",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const {
      params: {
        query: { id },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const userRepository = yield* UserRepository;
    const {
      id: userProfileId,
      name,
      avatar: avatarKey,
    } = yield* yield* userRepository.findUserProfileById({ id });

    const uploadClient = yield* UploadClient;
    const { url: avatar } = avatarKey
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: avatarKey },
        })
      : {};

    return {
      id: userProfileId,
      ...(name ? { name } : {}),
      ...(avatar ? { avatar } : {}),
    };
  }),
});
