import { authClient } from "@/utils/client/authClient";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { Effect } from "effect";
import jwt from "jsonwebtoken";
import { AuthClient } from "sport-reservation-auth/client";
import { getAuthClientBodyType } from "sport-reservation-auth/models";
import { effectType } from "sport-reservation-common/utils/effectType";
import { getCookie, setCookie } from "vinxi/http";

export const authKeys = {
  all: () => ["auth"] as const,
  line: {
    all: () => [...authKeys.all(), "line"] as const,
    request: () => [...authKeys.line.all(), "request"] as const,
    token: () => [...authKeys.line.all(), "token"] as const,
  },
  token: {
    all: () => [...authKeys.all(), "token"] as const,
    profile: () => [...authKeys.token.all(), "profile"] as const,
  },
};

export const lineLoginAuthTokenServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getAuthClientBodyType("postGetLineLoginAuthToken"), data),
    ),
  )
  .handler(async ({ data: { code, state } }) => {
    const { token } = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          return yield* (yield* AuthClient).postGetLineLoginAuthToken({
            body: { code, state },
          });
        }),
        authClient,
      ),
    );

    setCookie("token", token, {
      expires: new Date(
        ((jwt.decode(token, { complete: true })?.payload as jwt.JwtPayload)
          ?.exp ?? 0) * 1000,
      ),
      secure: true,
    });

    return { success: true };
  });

export const lineLoginAuthTokenQueryOptions = ({
  code,
  state,
}: {
  code: string;
  state: string;
}) =>
  queryOptions({
    queryKey: authKeys.line.token(),
    queryFn: () => lineLoginAuthTokenServerFn({ data: { code, state } }),
  });

export const lineLoginRequestServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return {
    success: true,
    ...(await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          return yield* (yield* AuthClient).getGenerateLineLoginRequest({});
        }),
        authClient,
      ),
    )),
  };
});

export const lineLoginRequestQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.line.token(),
    queryFn: () => lineLoginRequestServerFn(),
  });

export const userProfileServerFn = createServerFn({ method: "POST" }).handler(
  async () => {
    const token = getCookie("token");
    const profile = token
      ? await Effect.runPromise(
          Effect.provide(
            Effect.gen(function* () {
              return yield* (yield* AuthClient).getUserProfile({
                query: { token },
              });
            }),
            authClient,
          ),
        )
      : undefined;

    return { success: true, ...profile };
  },
);

export const userProfileQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.token.profile(),
    queryFn: () => userProfileServerFn(),
  });
