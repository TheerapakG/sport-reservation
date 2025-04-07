import { provideEffectContext } from "@/utils/effectContext";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { FriendClient } from "sport-reservation-friend/client";
import { parseCookies } from "vinxi/http";

export const friendKeys = () => ({
  all: () => ["friend"] as const,
  friend: () => {
    const allFriend = [...friendKeys().all(), "friend"] as const;
    return {
      all: () => allFriend,
      list: () => [...allFriend, "list"] as const,
    };
  },
});

export const getFriendListServerFn = createServerFn({
  method: "GET",
})
  .validator(
    type({
      limit: "number",
      offset: "number",
    }),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { friends } = await Effect.runPromise(
      Effect.gen(function* () {
        const friendClient = yield* FriendClient;
        return yield* friendClient.getFriendList({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, friends } as const;
  });

export const getFriendListInfiniteQueryOptions = ({
  limit,
}: {
  limit: number;
}) =>
  infiniteQueryOptions({
    queryKey: friendKeys().friend().list(),
    queryFn: ({ pageParam }) =>
      getFriendListServerFn({
        data: {
          limit,
          offset: pageParam,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.success
        ? lastPage.friends.length >= limit
          ? lastPageParam + lastPage.friends.length
          : undefined
        : undefined,
  });
