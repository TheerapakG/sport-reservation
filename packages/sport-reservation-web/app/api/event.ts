import { provideEffectContext } from "@/utils/effectContext";
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { serialize } from "cookie-es";
import { Effect, Match } from "effect";
import { EventClient } from "sport-reservation-event/client";
import {
  EventClientBodyType,
  getEventClientBodyType,
  getEventClientQueryType,
} from "sport-reservation-event/models";
import { effectType } from "tiara-stack/utils/effectType";
import { readTypedFormData } from "tiara-stack/utils/formData";
import { parseCookies } from "vinxi/http";

export const eventKeys = () => {
  const all = ["event"] as const;
  return {
    all: () => all,
    schedule: () => {
      const allSchedule = [...all, "schedule"] as const;
      return {
        all: () => allSchedule,
        id: ({ id }: { id: string }) => {
          const allScheduleId = [...allSchedule, "id", id] as const;
          return {
            all: () => allScheduleId,
            detail: () => [...allScheduleId, "detail"] as const,
            repeatIndex: ({ repeatIndex }: { repeatIndex: number }) => {
              const allScheduleIdRepeatIndex = [
                ...allScheduleId,
                "repeatIndex",
                repeatIndex,
              ] as const;
              return {
                all: () => allScheduleIdRepeatIndex,
                detail: () => [...allScheduleIdRepeatIndex, "detail"] as const,
                memberList: () =>
                  [...allScheduleIdRepeatIndex, "memberList"] as const,
              };
            },
          };
        },
        list: () => {
          const allScheduleList = [...allSchedule, "list"] as const;
          return {
            all: () => allScheduleList,
            date: ({ date }: { date: Date }) =>
              [...allScheduleList, "date", date.toISOString()] as const,
          };
        },
      };
    },
  };
};

export const getScheduleServerFn = createServerFn({
  method: "GET",
})
  .validator((data: unknown) =>
    Effect.runSync(effectType(getEventClientQueryType("getSchedule"), data)),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const schedule = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.getSchedule({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: { id: data.id },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, schedule } as const;
  });

export const getScheduleQueryOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: eventKeys().schedule().id({ id }).detail(),
    queryFn: () => getScheduleServerFn({ data: { scheduleId: id } }),
  });

export const getScheduleMemberListServerFn = createServerFn({
  method: "GET",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getEventClientQueryType("getScheduleMemberList"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { members } = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.getScheduleMemberList({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: { scheduleId: data.scheduleId, repeatIndex: data.repeatIndex },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, members } as const;
  });

export const getScheduleMemberListQueryOptions = ({
  id,
  repeatIndex,
}: {
  id: string;
  repeatIndex: number;
}) =>
  queryOptions({
    queryKey: eventKeys()
      .schedule()
      .id({ id })
      .repeatIndex({ repeatIndex })
      .memberList(),
    queryFn: () =>
      getScheduleMemberListServerFn({ data: { scheduleId: id, repeatIndex } }),
  });

export const getScheduleListServerFn = createServerFn({
  method: "GET",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getEventClientQueryType("getScheduleList"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { schedules } = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        const { schedules } = yield* eventClient.getScheduleList({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: {
            ...data,
            date: data.date.toISOString(),
          },
        });

        return {
          schedules: yield* Effect.all(
            schedules.map((schedule) =>
              Effect.gen(function* () {
                return {
                  ...schedule,
                  schedule: {
                    ...schedule.schedule,
                    startAt: yield* effectType(
                      type("string.date.parse"),
                      schedule.schedule.startAt,
                    ),
                    endAt: yield* effectType(
                      type("string.date.parse"),
                      schedule.schedule.endAt,
                    ),
                    repeatStartAt: yield* effectType(
                      type("string.date.parse"),
                      schedule.schedule.repeatStartAt,
                    ),
                    repeatEndAt: yield* effectType(
                      type("string.date.parse"),
                      schedule.schedule.repeatEndAt,
                    ),
                  },
                };
              }),
            ),
          ),
        };
      }).pipe(provideEffectContext),
    );

    return { success: true, schedules } as const;
  });

export const getScheduleListInfiniteQueryOptions = ({
  date,
  limit,
}: {
  date: Date;
  limit: number;
}) =>
  infiniteQueryOptions({
    queryKey: eventKeys().schedule().list().date({ date }),
    queryFn: ({ pageParam }) =>
      getScheduleListServerFn({
        data: {
          date: date.toISOString(),
          limit,
          offset: pageParam,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.success
        ? lastPage.schedules.length >= limit
          ? lastPageParam + lastPage.schedules.length
          : undefined
        : undefined,
  });

export const createEventValidators = type([
  type({
    creatorType: "'user'",
  }).and(getEventClientBodyType("postCreateUserEvent")),
  "|",
  type({
    creatorType: "'club'",
  }).and(getEventClientBodyType("postCreateClubEvent")),
]);

export const createEventServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(effectType(type("FormData"), data)),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const event = await Effect.runPromise(
      Effect.gen(function* () {
        const eventData = yield* readTypedFormData(createEventValidators, data);

        const eventClient = yield* EventClient;
        return yield* Match.value(eventData).pipe(
          Match.when({ creatorType: "user" }, ({ creatorType, ...event }) =>
            eventClient.postCreateUserEvent({
              headers: { Cookie: serialize("access_token", accessToken) },
              body: event,
            }),
          ),
          Match.when({ creatorType: "club" }, ({ creatorType, ...event }) =>
            eventClient.postCreateClubEvent({
              headers: { Cookie: serialize("access_token", accessToken) },
              body: event,
            }),
          ),
          Match.exhaustive,
        );
      }).pipe(provideEffectContext),
    );

    return { success: true, event } as const;
  });

export const useCreateEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys().all(),
      });
    },
  });
};

export const createScheduleServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getEventClientBodyType("postCreateSchedule"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const schedule = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.postCreateSchedule({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: {
            ...data,
            startAt: data.startAt.toISOString(),
            endAt: data.endAt.toISOString(),
            repeatStartAt: data.repeatStartAt.toISOString(),
            repeatEndAt: data.repeatEndAt.toISOString(),
          },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, schedule } as const;
  });

export const useCreateScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScheduleServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys().all(),
      });
    },
  });
};

export const requestScheduleCreateServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getEventClientBodyType("postScheduleRequestCreate"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const scheduleRequest = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.postScheduleRequestCreate({
          headers: { Cookie: serialize("access_token", accessToken) },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, scheduleRequest } as const;
  });

export const useRequestScheduleCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: EventClientBodyType<"postScheduleRequestCreate">["inferIn"];
    }) => requestScheduleCreateServerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys().all(),
      });
    },
  });
};
