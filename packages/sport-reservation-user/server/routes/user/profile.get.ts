import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig, params, response } from "tiara-stack/config";
import { userProfile } from "~/models/user";
import { UserRepository } from "~/repositories/userRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "getUserProfileById",
  response: response(userProfile, { stream: false }),
  query: params(
    type({
      id: "string",
    }),
  ),
});
export default /*@__PURE__*/ effectEventHandler(handlerConfig)(() =>
  Effect.gen(function* () {
    const {
      params: {
        query: { id },
      },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const userRepository = yield* UserRepository;
    const {
      publicId,
      name,
      avatar: avatarKey,
    } = yield* yield* userRepository.findUserProfileById({ publicId: id });

    const uploadClient = yield* UploadClient;
    const { url: avatar } = avatarKey
      ? yield* uploadClient.getDownloadPresignedUrl({
          query: { key: avatarKey },
        })
      : { url: undefined };

    return {
      id: publicId,
      ...(name ? { name } : {}),
      ...(avatar ? { avatar } : {}),
    };
  }),
);
