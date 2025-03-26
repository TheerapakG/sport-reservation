import { provideEffectContext } from "@/utils/effectContext";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { EventClient } from "sport-reservation-event/client";
import { getEventClientQueryType } from "sport-reservation-event/models";
import { effectType } from "tiara-stack/utils/effectType";

import { parseCookies } from "vinxi/http";

export const eventKeys = {
  all: () => ["event"] as const,
  event: () => {
    const allEvent = [...eventKeys.all(), "event"] as const;
    return {
      all: () => allEvent,
      list: () => {
        const allEventList = [...allEvent, "list"] as const;
        return {
          all: () => allEventList,
          date: ({ date }: { date: string }) =>
            [...allEventList, date] as const,
        };
      },
    };
  },
};

export const getEventListServerFn = createServerFn({
  method: "GET",
})
  .validator((data: unknown) =>
    Effect.runSync(effectType(getEventClientQueryType("getEventList"), data)),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const events = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.getEventList({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: {
            date: data.date.toISOString(),
            limit: data.limit,
            offset: data.offset,
          },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, events } as const;
  });

export const getEventListInfiniteQueryOptions = ({
  date,
  limit,
}: {
  date: Date;
  limit: number;
}) =>
  infiniteQueryOptions({
    queryKey: eventKeys.event().list().date({ date: date.toISOString() }),
    queryFn: ({ pageParam }) =>
      getEventListServerFn({
        data: {
          date: date.toISOString(),
          limit,
          offset: pageParam,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.success
        ? lastPage.events.length > 0
          ? lastPageParam + lastPage.events.length
          : undefined
        : undefined,
  });
