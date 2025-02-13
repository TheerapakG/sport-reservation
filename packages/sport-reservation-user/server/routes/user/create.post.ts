import { EventParamsContext, effectEventHandler } from "$/effectEventHandler";
import { Effect } from "effect";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { userProfile, userProfileCreate } from "~/models/user";
import { UserRepository } from "~/repositories/userRepository";

export const handlerConfig = defineEventHandlerConfig({
  name: "postCreateUserProfile",
  response: userProfile,
  body: userProfileCreate,
});
export default effectEventHandler({
  config: handlerConfig,
  handler: () =>
    /*@__PURE__*/ Effect.gen(function* () {
      const {
        params: { body },
      } = yield* EventParamsContext.typed<typeof handlerConfig>();

      const userRepository = yield* UserRepository;
      const {
        publicId,
        name,
        avatar: avatarKey,
      } = yield* yield* userRepository.createUserProfile({
        name: body.name,
        avatar: body.avatar,
      });

      const uploadClient = yield* UploadClient;
      const { url: avatar } = avatarKey
        ? yield* uploadClient.getDownloadPresignedUrl({
            query: { key: avatarKey },
          })
        : {
            url: undefined,
          };

      return {
        id: publicId,
        ...(name ? { name } : {}),
        ...(avatar ? { avatar } : {}),
      };
    }),
});
