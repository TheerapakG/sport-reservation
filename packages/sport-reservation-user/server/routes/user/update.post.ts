import {
  EventContext,
  EventParamsContext,
  effectEventHandler,
} from "$/effectEventHandler";
import { type } from "arktype";
import { Effect } from "effect";
import { getHeader } from "h3";
import { UploadClient } from "sport-reservation-upload/client";
import { defineEventHandlerConfig } from "tiara-stack/config";
import { noInferOut } from "tiara-stack/utils/noInfer";
import { AuthKey } from "~/layers";
import { userProfile } from "~/models/user";
import { UserRepository } from "~/repositories/userRepository";
import getUserProfile from "~~/client/methods/getUserProfile";

export const handlerConfig = defineEventHandlerConfig({
  name: "postUpdateUserProfile",
  response: userProfile,
  body: noInferOut(
    type({
      "name?": "string",
      "avatar?": "string",
    }),
  ),
});
export default effectEventHandler({
  config: handlerConfig,
  handler: /*@__PURE__*/ Effect.gen(function* () {
    const { event } = yield* EventContext;
    const {
      params: { body },
    } = yield* EventParamsContext.typed<typeof handlerConfig>();

    const authKey = yield* AuthKey;
    const { id } = yield* getUserProfile({
      token: getHeader(event, "authorization")?.split(" ", 2)[1] ?? "",
      authKey,
    });

    const userRepository = yield* UserRepository;
    const {
      publicId,
      name,
      avatar: avatarKey,
    } = yield* yield* userRepository.updateUserProfile({
      publicId: id,
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
