import { provideEffectContext } from "@/utils/effectContext";
import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { serialize } from "cookie-es";
import { Effect, Match } from "effect";
import { EventClient } from "sport-reservation-event/client";
import {
  getEventClientBodyType,
  getEventClientQueryType,
} from "sport-reservation-event/models";
import { readTypedFormData } from "tiara-stack/utils/formData";
import { parseCookies } from "vinxi/http";
import { currentUserProfileQueryOptions } from "./oauth";

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
            memberStatus: () => [...allScheduleId, "memberStatus"] as const,
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
        club: () => {
          const allScheduleClub = [...allSchedule, "club"] as const;
          return {
            all: () => allScheduleClub,
            id: ({ id }: { id: string }) => {
              const allScheduleClubId = [...allScheduleClub, "id", id] as const;
              return {
                all: () => allScheduleClubId,
                list: () => [...allScheduleClubId, "list"] as const,
              };
            },
          };
        },
        user: () => {
          const allScheduleUser = [...allSchedule, "user"] as const;
          return {
            all: () => allScheduleUser,
            id: ({ id }: { id?: string }) => {
              const allScheduleUserId = [...allScheduleUser, "id", id] as const;
              return {
                all: () => allScheduleUserId,
                member: () => {
                  const allScheduleUserIdMember = [
                    ...allScheduleUserId,
                    "member",
                  ] as const;
                  return {
                    all: () => allScheduleUserIdMember,
                    count: () => [...allScheduleUserIdMember, "count"] as const,
                    list: () => [...allScheduleUserIdMember, "list"] as const,
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

export const getScheduleServerFn = createServerFn({
  method: "GET",
})
  .validator(getEventClientQueryType("getSchedule"))
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
          query: { id: data.id, repeatIndex: data.repeatIndex },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, schedule } as const;
  });

export const getScheduleQueryOptions = ({
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
      .detail(),
    queryFn: () => getScheduleServerFn({ data: { id, repeatIndex } }),
  });

export const getScheduleMemberListServerFn = createServerFn({
  method: "GET",
})
  .validator(getEventClientQueryType("getScheduleMemberList"))
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
  .validator(getEventClientQueryType("getScheduleList"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { schedules } = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.getScheduleList({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: {
            ...data,
            date: data.date.toISOString(),
          },
        });
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
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

export const getUserMemberSchedulesCountServerFn = createServerFn({
  method: "GET",
})
  .validator(getEventClientQueryType("getUserMemberSchedulesCount"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { count } = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.getUserMemberSchedulesCount({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, count } as const;
  });

export const getUserMemberSchedulesCountQueryOptions = ({
  id,
}: {
  id: string;
}) => {
  return queryOptions({
    queryKey: eventKeys().schedule().user().id({ id }).member().count(),
    queryFn: () =>
      getUserMemberSchedulesCountServerFn({ data: { userId: id } }),
  });
};

export const getUserMemberSchedulesServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const { access_token: accessToken } = parseCookies();

  if (!accessToken) {
    return { success: false } as const;
  }

  const { schedules } = await Effect.runPromise(
    Effect.gen(function* () {
      const eventClient = yield* EventClient;
      return yield* eventClient.getUserMemberSchedules({
        headers: { Cookie: serialize("access_token", accessToken) },
      });
    }).pipe(provideEffectContext),
  );

  return { success: true, schedules } as const;
});

export const useGetUserMemberSchedulesQueryOptions = () => {
  const currentUserProfile = useSuspenseQuery(currentUserProfileQueryOptions());

  return queryOptions({
    queryKey: eventKeys()
      .schedule()
      .user()
      .id({ id: currentUserProfile.data.profile?.id })
      .member()
      .list(),
    queryFn: () => getUserMemberSchedulesServerFn(),
  });
};

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
  .validator(type("FormData"))
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
  .validator(getEventClientBodyType("postCreateSchedule"))
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
  .validator(getEventClientBodyType("postScheduleRequestCreate"))
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
    mutationFn: requestScheduleCreateServerFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventKeys().all(),
      });
    },
  });
};

export const getScheduleClubListServerFn = createServerFn({
  method: "GET",
})
  .validator(getEventClientQueryType("getClubCreatedSchedules"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const { schedules } = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.getClubCreatedSchedules({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: { clubId: data.clubId },
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, schedules } as const;
  });

export const getScheduleClubListQueryOptions = ({ id }: { id: string }) =>
  queryOptions({
    queryKey: eventKeys().schedule().club().id({ id }).list(),
    queryFn: () => getScheduleClubListServerFn({ data: { clubId: id } }),
  });

export const getScheduleMemberStatusServerFn = createServerFn({
  method: "GET",
})
  .validator(getEventClientQueryType("getScheduleMemberStatus"))
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false } as const;
    }

    const scheduleMemberStatus = await Effect.runPromise(
      Effect.gen(function* () {
        const eventClient = yield* EventClient;
        return yield* eventClient.getScheduleMemberStatus({
          headers: { Cookie: serialize("access_token", accessToken) },
          query: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true, scheduleMemberStatus } as const;
  });

export const useGetScheduleMemberStatusQueryOptions = ({
  id,
}: {
  id: string;
}) =>
  queryOptions({
    queryKey: eventKeys().schedule().id({ id }).memberStatus(),
    queryFn: () =>
      getScheduleMemberStatusServerFn({ data: { scheduleId: id } }),
  });
