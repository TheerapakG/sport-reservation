import { provideEffectContext } from "@/utils/effectContext";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { UserClient } from "sport-reservation-user/client";

import { parseCookies } from "vinxi/http";

export const userKeys = {
  all: () => ["user"] as const,
  user: () => {
    const allUser = [...userKeys.all(), "user"] as const;
    return {
      all: () => allUser,
      current: () => [...allUser, "current"] as const,
    };
  },
};

export const getCurrentUserProfileServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const { access_token: accessToken } = parseCookies();

  if (!accessToken) {
    return { success: false } as const;
  }

  const profile = await Effect.runPromise(
    Effect.gen(function* () {
      const userClient = yield* UserClient;
      return yield* userClient.getUserProfile({
        headers: { Cookie: serialize("access_token", accessToken) },
        query: {},
      });
    }).pipe(provideEffectContext),
  );

  return { success: true, profile } as const;
});

export const getCurrentUserProfileQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.user().current(),
    queryFn: getCurrentUserProfileServerFn,
  });
