import { provideEffectContext } from "@/utils/effectContext";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
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
} from "sport-reservation-matching/models";
import { effectType } from "tiara-stack/utils/effectType";
import { parseCookies } from "vinxi/http";
import { currentUserProfileQueryOptions } from "./oauth";

export const matchingKeys = () => {
  const all = ["matching"] as const;
  return {
    all: () => all,
    assessment: () => {
      const allAssessment = [...all, "assessment"] as const;
      return {
        all: () => allAssessment,
        general: () => {
          const allAssessmentGeneral = [...allAssessment, "general"] as const;
          return {
            all: () => allAssessmentGeneral,
            v1: () => {
              const allAssessmentGeneralV1 = [
                ...allAssessmentGeneral,
                "v1",
              ] as const;
              return {
                all: () => allAssessmentGeneralV1,
                list: () => [...allAssessmentGeneralV1, "list"] as const,
              };
            },
          };
        },
      };
    },
    cursor: () => {
      const allCursor = [...all, "cursor"] as const;
      return {
        all: () => allCursor,
        user: () => {
          const allCursorUser = [...allCursor, "user"] as const;
          return {
            all: () => allCursorUser,
            id: ({ id }: { id?: string }) => {
              const allCursorUserId = [...allCursorUser, "id", id] as const;
              return {
                all: () => allCursorUserId,
                current: () => [...allCursorUserId, "current"] as const,
              };
            },
          };
        },
        id: ({ id }: { id: string }) => {
          const allCursorId = [...allCursor, "id", id] as const;
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
  .validator(getMatchingClientBodyType("createGeneralAssessmentV1"))
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

export const useCreateGeneralAssessmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGeneralAssessmentServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingKeys().assessment().general().all(),
      });
    },
  });
};

export const createBadmintonAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator(getMatchingClientBodyType("createBadmintonAssessmentV1"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createBadmintonAssessmentV1({
          headers: {
            Cookie: serialize("access_token", accessToken),
          },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateBadmintonAssessmentMutation = () =>
  useMutation({
    mutationFn: createBadmintonAssessmentServerFn,
  });

export const createTennisAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator(getMatchingClientBodyType("createTennisAssessmentV1"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createTennisAssessmentV1({
          headers: {
            Cookie: serialize("access_token", accessToken),
          },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateTennisAssessmentMutation = () =>
  useMutation({
    mutationFn: createTennisAssessmentServerFn,
  });

export const createRunningAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator(getMatchingClientBodyType("createRunningAssessmentV1"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createRunningAssessmentV1({
          headers: {
            Cookie: serialize("access_token", accessToken),
          },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateRunningAssessmentMutation = () =>
  useMutation({
    mutationFn: createRunningAssessmentServerFn,
  });

export const getGeneralAssessmentV1ListServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const { access_token: accessToken } = parseCookies();

  if (!accessToken) {
    return { success: false } as const;
  }

  const { assessments } = await Effect.runPromise(
    Effect.gen(function* () {
      const matchingClient = yield* MatchingClient;
      return yield* matchingClient.getGeneralAssessmentV1List({
        headers: { Cookie: serialize("access_token", accessToken) },
      });
    }).pipe(provideEffectContext),
  );

  return { success: true, assessments } as const;
});

export const getGeneralAssessmentV1ListQueryOptions = () =>
  queryOptions({
    queryKey: matchingKeys().assessment().general().v1().list(),
    queryFn: getGeneralAssessmentV1ListServerFn,
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

export const useGetMatchingCursorQueryOptions = () => {
  const currentUserProfile = useSuspenseQuery(currentUserProfileQueryOptions());

  return queryOptions({
    queryKey: matchingKeys()
      .cursor()
      .user()
      .id({ id: currentUserProfile.data.profile?.id })
      .current(),
    queryFn: getMatchingCursorServerFn,
  });
};

export const createMatchingCursorServerFn = createServerFn({
  method: "POST",
})
  .validator(getMatchingClientBodyType("createMatchingCursor"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const cursor = await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createMatchingCursor({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, cursor } as const;
  });

export const useCreateMatchingCursorMutation = () => {
  const queryClient = useQueryClient();
  const currentUserProfile = useSuspenseQuery(currentUserProfileQueryOptions());

  return useMutation({
    mutationFn: createMatchingCursorServerFn,
    onSuccess: (data) => {
      queryClient.setQueryData(
        matchingKeys()
          .cursor()
          .user()
          .id({ id: currentUserProfile.data.profile?.id })
          .current(),
        data,
      );
    },
  });
};

export const getAllMatchedUsersServerFn = createServerFn({
  method: "GET",
})
  .validator(getMatchingClientQueryType("getAllMatchedUsers"))
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
  .validator(getMatchingClientBodyType("matchUsers"))
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
    mutationFn: matchUsersServerFn,
    onSuccess: (data, { data: { cursorId } }) => {
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
