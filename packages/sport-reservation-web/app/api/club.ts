import { provideEffectContext } from "@/utils/effectContext";
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { ClubClient } from "sport-reservation-club/client";
import {
  ClubClientBodyType,
  getClubClientBodyType,
  getClubClientQueryType,
} from "sport-reservation-club/models";
import { parseCookies } from "vinxi/http";
import { currentUserProfileQueryOptions } from "./oauth";

export const clubKeys = () => {
  const all = ["club"] as const;
  return {
    all: () => all,
    club: () => {
      const allClub = [...all, "club"] as const;
      return {
        all: () => allClub,
        list: () => [...allClub, "list"] as const,
        id: ({ id }: { id?: string }) => {
          const allClubId = [...allClub, "id", id] as const;
          return {
            all: () => allClubId,
            detail: () => [...allClubId, "detail"] as const,
            memberList: () => [...allClubId, "memberList"] as const,
            status: () => [...allClubId, "status"] as const,
          };
        },
        user: () => {
          const allClubUser = [...allClub, "user"] as const;
          return {
            all: () => allClubUser,
            id: ({ id }: { id?: string }) => {
              const allClubUserId = [...allClubUser, "id", id] as const;
              return {
                all: () => allClubUserId,
                member: () => {
                  const allClubUserIdMember = [
                    ...allClubUserId,
                    "member",
                  ] as const;
                  return {
                    all: () => allClubUserIdMember,
                    count: () => [...allClubUserIdMember, "count"] as const,
                    list: () => [...allClubUserIdMember, "list"] as const,
                  };
                },
              };
            },
          };
        },
      };
    },
  };
};

export const getClubServerFn = createServerFn({
  method: "GET",
})
  .validator(getClubClientQueryType("getClub"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const club = await Effect.runPromise(
      Effect.gen(function* () {
        const clubClient = yield* ClubClient;
        return yield* clubClient.getClub({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: { clubId: data.clubId },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, club } as const;
  });

export const getClubQueryOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: clubKeys().club().id({ id }).detail(),
    queryFn: () => getClubServerFn({ data: { clubId: id } }),
  });

export const getClubMemberListServerFn = createServerFn({
  method: "GET",
})
  .validator(getClubClientQueryType("getClubMembers"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { members } = await Effect.runPromise(
      Effect.gen(function* () {
        const clubClient = yield* ClubClient;
        return yield* clubClient.getClubMembers({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: { clubId: data.clubId },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, members } as const;
  });

export const getClubMemberListQueryOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: clubKeys().club().id({ id }).memberList(),
    queryFn: () => getClubMemberListServerFn({ data: { clubId: id } }),
  });

export const getUserMemberClubCountServerFn = createServerFn({
  method: "GET",
})
  .validator(getClubClientQueryType("getUserMemberClubsCount"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { count } = await Effect.runPromise(
      Effect.gen(function* () {
        const clubClient = yield* ClubClient;
        return yield* clubClient.getUserMemberClubsCount({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, count } as const;
  });

export const getUserMemberClubCountQueryOptions = ({ id }: { id: string }) => {
  return queryOptions({
    queryKey: clubKeys().club().user().id({ id }).member().count(),
    queryFn: () => getUserMemberClubCountServerFn({ data: { userId: id } }),
  });
};

export const getUserMemberClubListServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const { access_token: accessToken } = parseCookies();

  if (!accessToken) {
    return { success: false } as const;
  }

  const { clubs } = await Effect.runPromise(
    Effect.gen(function* () {
      const clubClient = yield* ClubClient;
      return yield* clubClient.getUserMemberClubs({
        headers: { Cookie: serialize("access_token", accessToken) },
      });
    }).pipe(provideEffectContext),
  );

  return { success: true, clubs } as const;
});

export const useGetUserMemberClubListQueryOptions = () => {
  const currentUserProfile = useSuspenseQuery(currentUserProfileQueryOptions());

  return queryOptions({
    queryKey: clubKeys()
      .club()
      .user()
      .id({ id: currentUserProfile.data.profile?.id })
      .member()
      .list(),
    queryFn: getUserMemberClubListServerFn,
  });
};

export const getClubListServerFn = createServerFn({
  method: "GET",
})
  .validator(getClubClientQueryType("getClubList"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { clubs } = await Effect.runPromise(
      Effect.gen(function* () {
        const clubClient = yield* ClubClient;
        return yield* clubClient.getClubList({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, clubs } as const;
  });

export const getClubListInfiniteQueryOptions = ({ limit }: { limit: number }) =>
  infiniteQueryOptions({
    queryKey: clubKeys().club().list(),
    queryFn: ({ pageParam }) =>
      getClubListServerFn({
        data: {
          limit,
          offset: pageParam,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.success
        ? lastPage.clubs.length >= limit
          ? lastPageParam + lastPage.clubs.length
          : undefined
        : undefined,
  });

export const requestClubMembershipCreateServerFn = createServerFn({
  method: "POST",
})
  .validator(getClubClientBodyType("postCreateClubMembershipRequest"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const clubMembershipRequest = await Effect.runPromise(
      Effect.gen(function* () {
        const clubClient = yield* ClubClient;
        return yield* clubClient.postCreateClubMembershipRequest({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, clubMembershipRequest } as const;
  });

export const useRequestClubMembershipCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: ClubClientBodyType<"postCreateClubMembershipRequest">["inferIn"];
    }) => requestClubMembershipCreateServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clubKeys().all(),
      });
    },
  });
};

export const getClubMemberStatusServerFn = createServerFn({
  method: "GET",
})
  .validator(getClubClientQueryType("getClubMemberStatus"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const clubMemberStatus = await Effect.runPromise(
      Effect.gen(function* () {
        const clubClient = yield* ClubClient;
        return yield* clubClient.getClubMemberStatus({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, clubMemberStatus } as const;
  });

export const useGetClubMemberStatusQueryOptions = ({ id }: { id: string }) => {
  const currentUserProfile = useSuspenseQuery(currentUserProfileQueryOptions());

  return queryOptions({
    queryKey: clubKeys().club().id({ id }).status(),
    queryFn: () =>
      getClubMemberStatusServerFn({
        data: {
          clubId: id,
          userId: currentUserProfile.data.profile?.id ?? "",
        },
      }),
  });
};
