import { provideEffectContext } from "@/utils/effectContext";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { MatchingClient } from "sport-reservation-matching/client";
import {
  getMatchingClientBodyType,
  getMatchingClientQueryType,
  getMatchingClientResponseType,
  type MatchingClientBodyType,
} from "sport-reservation-matching/models";
import { effectType } from "tiara-stack/utils/effectType";
import { parseCookies } from "vinxi/http";

export const matchingKeys = () => {
  const all = ["matching"] as const;
  return {
    all: () => all,
    cursor: () => {
      const allCursor = [...all, "cursor"] as const;
      return {
        all: () => allCursor,
        current: () => [...allCursor, "current"] as const,
        id: ({ id }: { id: string }) => {
          const allCursorId = [...allCursor, id] as const;
          return {
            all: () => allCursorId,
            matches: () => [...allCursorId, "matches"] as const,
          };
        },
      };
    },
  };
};

export const createGeneralAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getMatchingClientBodyType("createGeneralAssessmentV1"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createGeneralAssessmentV1({
          headers: {
            Cookie: serialize("access_token", accessToken),
          },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateGeneralAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createGeneralAssessmentV1">["inferIn"];
    }) => createGeneralAssessmentServerFn({ data }),
  });

export const createBadmintonAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getMatchingClientBodyType("createBadmintonAssessmentV1"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createBadmintonAssessmentV1({
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateBadmintonAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createBadmintonAssessmentV1">["inferIn"];
    }) => createBadmintonAssessmentServerFn({ data }),
  });

export const createTennisAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getMatchingClientBodyType("createTennisAssessmentV1"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createTennisAssessmentV1({
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateTennisAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createTennisAssessmentV1">["inferIn"];
    }) => createTennisAssessmentServerFn({ data }),
  });

export const createRunningAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getMatchingClientBodyType("createRunningAssessmentV1"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createRunningAssessmentV1({
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateRunningAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createRunningAssessmentV1">["inferIn"];
    }) => createRunningAssessmentServerFn({ data }),
  });

export const getMatchingCursorServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const { access_token: accessToken } = parseCookies();

  if (!accessToken) {
    return { success: false } as const;
  }

  const cursor = await Effect.runPromise(
    Effect.gen(function* () {
      const matchingClient = yield* MatchingClient;
      return yield* matchingClient.getMatchingCursor({
        headers: { Cookie: serialize("access_token", accessToken) },
      });
    }).pipe(provideEffectContext),
  );

  return { success: true, cursor } as const;
});

export const getMatchingCursorQueryOptions = () =>
  queryOptions({
    queryKey: matchingKeys().cursor().current(),
    queryFn: getMatchingCursorServerFn,
  });

export const createMatchingCursorServerFn = createServerFn({
  method: "POST",
}).handler(async () => {
  const { access_token: accessToken } = parseCookies();

  if (!accessToken) {
    return { success: false } as const;
  }

  const cursor = await Effect.runPromise(
    Effect.gen(function* () {
      const matchingClient = yield* MatchingClient;
      return yield* matchingClient.createMatchingCursor({
        headers: { Cookie: serialize("access_token", accessToken) },
      });
    }).pipe(provideEffectContext),
  );

  return { success: true, cursor } as const;
});

export const useCreateMatchingCursorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createMatchingCursorServerFn(),
    onSuccess: (data) => {
      queryClient.setQueryData(matchingKeys().cursor().current(), data);
    },
  });
};

export const getAllMatchedUsersServerFn = createServerFn({
  method: "GET",
})
  .validator((query: unknown) =>
    Effect.runSync(
      effectType(getMatchingClientQueryType("getAllMatchedUsers"), query),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { matches } = await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.getAllMatchedUsers({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, matches } as const;
  });

export const getAllMatchedUsersQueryOptions = ({
  cursorId,
}: {
  cursorId: string;
}) =>
  queryOptions({
    queryKey: matchingKeys().cursor().id({ id: cursorId }).matches(),
    queryFn: () => getAllMatchedUsersServerFn({ data: { cursorId } }),
  });

export const matchUsersServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(effectType(getMatchingClientBodyType("matchUsers"), data)),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { matches } = await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.matchUsers({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, matches } as const;
  });

export const useMatchUsersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MatchingClientBodyType<"matchUsers">["inferIn"]) =>
      matchUsersServerFn({ data }),
    onSuccess: (data, { cursorId }) => {
      queryClient.setQueryData(
        matchingKeys().cursor().id({ id: cursorId }).matches(),
        (oldData) => {
          if (!oldData) return data;

          const typedOldData = Effect.runSync(
            effectType(
              type({
                success: "boolean",
                matches:
                  getMatchingClientResponseType("matchUsers").get("matches"),
              }),
              oldData,
            ),
          );

          return {
            success: data.success,
            matches: data.success
              ? [...typedOldData.matches, ...data.matches]
              : typedOldData.matches,
          };
        },
      );
    },
  });
};
