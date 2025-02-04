import { Effect } from "effect";
import jwt from "jsonwebtoken";
import { defineClientMethodConfig } from "tiara-stack/config";
import { effectType } from "tiara-stack/utils/effectType";
import { userProfile } from "~/models";

export const methodConfig = defineClientMethodConfig({
  name: "getUserProfile",
});

export default ({
  token,
  authKey,
}: {
  token: string;
  authKey: { public: Buffer };
}) => {
  return Effect.gen(function* () {
    const jwtPayload = yield* Effect.try(() =>
      jwt.verify(token, authKey.public, {
        algorithms: ["RS256"],
        complete: true,
      }),
    );

    const profile = yield* effectType(userProfile, jwtPayload.payload);

    return profile;
  });
};
