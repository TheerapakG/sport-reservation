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
import { effectType } from "tiara-stack/utils/effectType";
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
                list: () => {
                  const allClubUserIdList = [...allClubUserId, "list"] as const;
                  return {
                    all: () => allClubUserIdList,
                    member: () => [...allClubUserIdList, "member"] as const,
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
  .validator((data: unknown) =>
    Effect.runSync(effectType(getClubClientQueryType("getClub"), data)),
  )
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
    queryFn: () => getClubServerFn({ data: { id } }),
  });

export const getClubMemberListServerFn = createServerFn({
  method: "GET",
})
  .validator((data: unknown) =>
    Effect.runSync(effectType(getClubClientQueryType("getClubMembers"), data)),
  )
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

export const getUserClubMemberListServerFn = createServerFn({
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

export const useGetUserClubMemberListQueryOptions = () => {
  const currentUserProfile = useSuspenseQuery(currentUserProfileQueryOptions());

  return queryOptions({
    queryKey: clubKeys()
      .club()
      .user()
      .id({ id: currentUserProfile.data.profile?.id })
      .list()
      .member(),
    queryFn: getUserClubMemberListServerFn,
  });
};

export const getClubListServerFn = createServerFn({
  method: "GET",
})
  .validator((data: unknown) =>
    Effect.runSync(effectType(getClubClientQueryType("getClubList"), data)),
  )
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
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getClubClientBodyType("postCreateClubMembershipRequest"),
        data,
      ),
    ),
  )
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
