import { provideEffectContext } from "@/utils/effectContext";
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { UserClient } from "sport-reservation-user/client";
import { getUserClientBodyType } from "sport-reservation-user/models";
import { effectType } from "tiara-stack/utils/effectType";

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

export const updateCurrentUserProfileServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getUserClientBodyType("postUpdateUserProfile").omit("id"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const profile = await Effect.runPromise(
      Effect.gen(function* () {
        const userClient = yield* UserClient;
        return yield* userClient.postUpdateUserProfile({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: {
            ...data,
            birthDate: data.birthDate?.toISOString(),
          },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, profile } as const;
  });

export const useUpdateCurrentUserProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUserProfileServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.user().current(),
      });
    },
  });
};

// Sport Association
export const associateSportServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getUserClientBodyType("postCreateUserSportAssociation"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const userClient = yield* UserClient;
        return yield* userClient.postCreateUserSportAssociation({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true } as const;
  });

export const useAssociateSportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: associateSportServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.user().current(),
      });
    },
  });
};

export const dissociateSportServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getUserClientBodyType("postDeleteUserSportAssociations"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const userClient = yield* UserClient;
        return yield* userClient.postDeleteUserSportAssociations({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true } as const;
  });

export const useDissociateSportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dissociateSportServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.user().current(),
      });
    },
  });
};

// Objective Association
export const associateObjectiveServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getUserClientBodyType("postCreateUserObjectiveAssociation"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const userClient = yield* UserClient;
        return yield* userClient.postCreateUserObjectiveAssociation({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true } as const;
  });

export const useAssociateObjectiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: associateObjectiveServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.user().current(),
      });
    },
  });
};

export const dissociateObjectiveServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getUserClientBodyType("postDeleteUserObjectiveAssociations"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const userClient = yield* UserClient;
        return yield* userClient.postDeleteUserObjectiveAssociations({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true } as const;
  });

export const useDissociateObjectiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dissociateObjectiveServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.user().current(),
      });
    },
  });
};

// Location Association
export const associateLocationServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getUserClientBodyType("postCreateUserLocationAssociation"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const userClient = yield* UserClient;
        return yield* userClient.postCreateUserLocationAssociation({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true } as const;
  });

export const useAssociateLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: associateLocationServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.user().current(),
      });
    },
  });
};

export const dissociateLocationServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getUserClientBodyType("postDeleteUserLocationAssociations"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const userClient = yield* UserClient;
        return yield* userClient.postDeleteUserLocationAssociations({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true } as const;
  });

export const useDissociateLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dissociateLocationServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.user().current(),
      });
    },
  });
};
