import { oAuthClient, OAuthClient } from "@/utils/client/oauthClient";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { type } from "arktype";
import { Effect } from "effect";
import { subjects } from "sport-reservation-oauth-common/subjects";
import { effectType } from "tiara-stack/utils/effectType";
import { getRequestHeaders, parseCookies, setCookie } from "vinxi/http";

export const oauthKeys = {
  all: () => ["oauth"] as const,
  userProfile: () => [...oauthKeys.all(), "userProfile"] as const,
  login: () => [...oauthKeys.all(), "login"] as const,
  exchange: () => [...oauthKeys.all(), "exchange"] as const,
};

export const currentUserProfileServerFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const { access_token: accessToken, refresh_token: refreshToken } =
    parseCookies();

  if (!accessToken) {
    return { success: false, profile: undefined };
  }

  const verified = await Effect.runPromise(
    Effect.gen(function* () {
      const oauthClient = yield* OAuthClient;
      return yield* Effect.promise(() =>
        oauthClient.verify(subjects, accessToken, {
          refresh: refreshToken,
        }),
      );
    }).pipe(Effect.provide(oAuthClient)),
  );

  if (verified.err) {
    return { success: false, profile: undefined };
  }
  if (verified.tokens) {
    setCookie("access_token", verified.tokens.access, {});
    setCookie("refresh_token", verified.tokens.refresh, {});
  }

  return { success: true, profile: verified.subject.properties };
});

export const currentUserProfileQueryOptions = () =>
  queryOptions({
    queryKey: oauthKeys.userProfile(),
    queryFn: () => currentUserProfileServerFn(),
  });

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    Effect.runSync(effectType(type({ "provider?": "string" }), data)),
  )
  .handler(async ({ data: { provider } }) => {
    const headers = await Effect.runPromise(
      Effect.promise(async () => await getRequestHeaders()),
    );
    const host = headers["Host"];
    const protocol = host?.includes("localhost") ? "http" : "https";
    const { url } = await Effect.runPromise(
      Effect.gen(function* () {
        const oauthClient = yield* OAuthClient;
        return yield* Effect.promise(() =>
          oauthClient.authorize(
            `${protocol}://${host}/login/callback`,
            "code",
            { provider },
          ),
        );
      }).pipe(Effect.provide(oAuthClient)),
    );

    return { success: true, url };
  });

export const loginQueryOptions = ({ provider }: { provider?: string }) =>
  queryOptions({
    queryKey: oauthKeys.login(),
    queryFn: () => loginServerFn({ data: { provider } }),
  });

export const exchangeServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    Effect.runSync(effectType(type({ code: "string" }), data)),
  )
  .handler(async ({ data: { code } }) => {
    const headers = await Effect.runPromise(
      Effect.promise(async () => await getRequestHeaders()),
    );
    const host = headers["Host"];
    const protocol = host?.includes("localhost") ? "http" : "https";
    const exchanged = await Effect.runPromise(
      Effect.gen(function* () {
        const oauthClient = yield* OAuthClient;
        return yield* Effect.promise(() =>
          oauthClient.exchange(code, `${protocol}://${host}/login/callback`),
        );
      }).pipe(Effect.provide(oAuthClient)),
    );
    if (exchanged.err) return { success: false };

    setCookie("access_token", exchanged.tokens.access, {});
    setCookie("refresh_token", exchanged.tokens.refresh, {});

    return { success: true };
  });

export const exchangeQueryOptions = ({ code }: { code: string }) =>
  queryOptions({
    queryKey: oauthKeys.exchange(),
    queryFn: () => exchangeServerFn({ data: { code } }),
  });
