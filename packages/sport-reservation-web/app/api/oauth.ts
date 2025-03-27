import { OAuthClient } from "@/layers/client/oauthClient";
import { provideEffectContext } from "@/utils/effectContext";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { Effect } from "effect";
import { subjects } from "sport-reservation-oauth-common/subjects";
import { effectType } from "tiara-stack/utils/effectType";
import {
  getRequestHost,
  getRequestProtocol,
  parseCookies,
  setCookie,
} from "vinxi/http";

export const oauthKeys = () => {
  const all = ["oauth"] as const;
  return {
    all: () => all,
    userProfile: () => [...all, "userProfile"] as const,
    login: ({ provider }: { provider?: string }) =>
      [...all, "login", provider] as const,
  };
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
    }).pipe(provideEffectContext),
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
    queryKey: oauthKeys().userProfile(),
    queryFn: () => currentUserProfileServerFn(),
  });

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    Effect.runSync(effectType(type({ "provider?": "string" }), data)),
  )
  .handler(async ({ data: { provider } }) => {
    console.log("run login");
    const { url } = await Effect.runPromise(
      Effect.gen(function* () {
        const oauthClient = yield* OAuthClient;
        return yield* Effect.promise(() =>
          oauthClient.authorize(
            `${getRequestProtocol()}://${getRequestHost()}/login/callback`,
            "code",
            { provider },
          ),
        );
      }).pipe(provideEffectContext),
    );

    return { success: true, url };
  });

export const loginQueryOptions = ({ provider }: { provider?: string }) =>
  queryOptions({
    queryKey: oauthKeys().login({ provider }),
    queryFn: () => loginServerFn({ data: { provider } }),
  });

export const exchangeServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    Effect.runSync(effectType(type({ code: "string" }), data)),
  )
  .handler(async ({ data: { code } }) => {
    const exchanged = await Effect.runPromise(
      Effect.gen(function* () {
        const oauthClient = yield* OAuthClient;
        return yield* Effect.promise(() =>
          oauthClient.exchange(
            code,
            `${getRequestProtocol()}://${getRequestHost()}/login/callback`,
          ),
        );
      }).pipe(provideEffectContext),
    );
    if (exchanged.err) return { success: false };

    setCookie("access_token", exchanged.tokens.access, {});
    setCookie("refresh_token", exchanged.tokens.refresh, {});

    return { success: true };
  });

export const useExchangeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code }: { code: string }) =>
      exchangeServerFn({ data: { code } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: oauthKeys().all() });
    },
  });
};
