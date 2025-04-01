import { provideEffectContext } from "@/utils/effectContext";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { ClubClient } from "sport-reservation-club/client";
import { parseCookies } from "vinxi/http";
import { currentUserProfileQueryOptions } from "./oauth";

export const clubKeys = () => {
  const all = ["club"] as const;
  return {
    all: () => all,
    user: () => {
      const allUser = [...all, "user"] as const;
      return {
        all: () => allUser,
        id: ({ id }: { id?: string }) => {
          const allUserId = [...allUser, "id", id] as const;
          return {
            all: () => allUserId,
            list: () => {
              const allUserIdList = [...allUserId, "list"] as const;
              return {
                all: () => allUserIdList,
                member: () => [...allUserIdList, "member"] as const,
              };
            },
          };
        },
      };
    },
  };
};

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
      .user()
      .id({ id: currentUserProfile.data.profile?.id })
      .list()
      .member(),
    queryFn: getUserClubMemberListServerFn,
  });
};
