import {
  getScheduleMemberListQueryOptions,
  getScheduleQueryOptions,
  useGetScheduleMemberStatusQueryOptions,
} from "@/api/event";
import EventJoinModal from "@/components/event/EventJoinModal";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { format } from "date-fns";
import { addSeconds } from "date-fns/fp";
import { Effect, Match, pipe } from "effect";
import { ChevronLeftIcon, ClockIcon, PinIcon, UsersIcon } from "lucide-react";
import { clubType } from "sport-reservation-club/models";
import { userProfile } from "sport-reservation-user/models";
import { effectType } from "tiara-stack/utils/effectType";

const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.navigate({ to: "/event" })}
      className={cn(
        "h-auto rounded border-1 border-[#65D1F8] bg-[#E1F8FE] px-3 py-1 align-middle font-semibold text-[#65D1F8] hover:bg-[#E1F8FE] hover:text-[#65D1F8] dark:bg-[#E1F8FE]",
        className,
      )}
    >
      <ChevronLeftIcon className="h-4 w-4" /> Back to Events
    </Button>
  );
};

function EventDetailPage() {
  const { scheduleId, repeatIndex } = Route.useLoaderData();

  const scheduleQuery = useSuspenseQuery(
    getScheduleQueryOptions({ id: scheduleId, repeatIndex }),
  );
  const memberListQuery = useSuspenseQuery(
    getScheduleMemberListQueryOptions({ id: scheduleId, repeatIndex }),
  );

  const getScheduleMemberStatusQueryOptions =
    useGetScheduleMemberStatusQueryOptions({
      id: scheduleId,
    });
  const scheduleMemberStatusQuery = useSuspenseQuery(
    getScheduleMemberStatusQueryOptions,
  );

  if (!scheduleQuery.data.success) {
    return (
      <div className="flex flex-col gap-y-4 px-8 py-4">
        <BackButton className="h-8 w-36" />
        <p>Event not found!</p>
      </div>
    );
  }

  const {
    schedule: { schedule, participants },
  } = scheduleQuery.data;

  const creator = Match.value(schedule.event).pipe(
    Match.when({ eventCreatorType: "user" }, ({ creator }) => {
      return {
        eventCreatorType: "user" as const,
        creator: creator as typeof userProfile.infer,
      };
    }),
    Match.when({ eventCreatorType: "club" }, ({ creator }) => {
      return {
        eventCreatorType: "club" as const,
        creator: creator as typeof clubType.infer,
      };
    }),
    Match.exhaustive,
  );

  const userCreator = Match.value(creator).pipe(
    Match.when({ eventCreatorType: "user" }, ({ creator }) => creator),
    Match.when({ eventCreatorType: "club" }, ({ creator }) => creator.creator),
    Match.exhaustive,
  );

  const clubCreator = Match.value(creator).pipe(
    Match.when({ eventCreatorType: "user" }, () => undefined),
    Match.when({ eventCreatorType: "club" }, ({ creator }) => creator),
    Match.exhaustive,
  );

  const actualStartAt = pipe(
    schedule?.schedule.startAt ?? new Date(),
    addSeconds(repeatIndex * schedule.schedule.repeatInterval),
  );
  const actualEndAt = pipe(
    schedule?.schedule.endAt ?? new Date(),
    addSeconds(repeatIndex * schedule.schedule.repeatInterval),
  );

  return (
    <div className="flex flex-col gap-y-4 px-8 py-4">
      <BackButton className="h-8 w-36" />

      <div className="flex flex-col gap-y-2">
        <h1 className="text-4xl font-bold">{schedule.event.name}</h1>
        <div className="flex gap-x-2">
          <UserAvatar profile={userCreator} className="h-12 w-12" />
          <div className="flex flex-col">
            <p className="text-base font-semibold text-gray-500">Hosted by</p>
            <p className="text-base font-semibold">{userCreator.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <img
            src={
              schedule.event.image ||
              "https://cdn.theerapakg.moe/reservation/asset/event/badminton-default.jpg"
            }
            alt={schedule.event.name}
            className="h-72 rounded object-cover"
          />
          <p className="text-base">
            {schedule.event.description ?? "No description"}
          </p>
        </div>
        <div className="flex flex-col gap-y-4">
          {clubCreator && (
            <Link
              to="/club/$clubId"
              params={{ clubId: clubCreator.id }}
              className="flex flex-col gap-y-2 rounded-lg border border-gray-400 p-4"
            >
              <h1 className="text-center text-xl font-semibold">
                This event is hosted by
              </h1>
              <h1 className="text-center text-xl font-semibold">
                {clubCreator.name} club
              </h1>
            </Link>
          )}
          <div className="flex gap-x-4">
            <ClockIcon className="h-8 w-8" />
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                {format(actualStartAt, "EEEE PPP HH:mm")} -{" "}
                {format(actualEndAt, "EEEE PPP HH:mm")}
              </h1>
            </div>
          </div>
          <div className="flex gap-x-4">
            <PinIcon className="h-8 w-8" />
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                {schedule.event.locationDescription ?? "No location specified"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <h1 className="text-xl font-semibold">
          Participants ({participants.participants})
        </h1>
        <div className="flex items-center space-x-2 rounded-lg bg-gray-200 p-4">
          {memberListQuery.data.members
            ?.filter(Boolean)
            .slice(0, 4)
            .map((member, index) => (
              <div key={index} className="flex flex-col items-center gap-y-2">
                <UserAvatar profile={member.user} className="h-12 w-12" />
                <span className="text-sm">{member.user?.name}</span>
                <span className="text-xs text-gray-600">
                  {userCreator?.id === member.user?.id ? "Host" : "Member"}
                </span>
                {member.size > 1 && (
                  <span className="text-xs text-gray-600">
                    <UsersIcon className="h-4 w-4" />
                    {member.size - 1} guest{member.size - 1 > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            ))}
          {participants.participants > 4 && (
            <span className="text-sm">
              + {participants.participants - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="bg-background/95 supports-backdrop-filter:bg-background/60 flex w-full items-center justify-between border-t backdrop-blur-sm">
        <div className="flex flex-col py-2 pl-4">
          <p className="text-sm text-gray-600">
            {format(actualStartAt, "PPP HH:mm")} -{" "}
            {format(actualEndAt, "PPP HH:mm")}
          </p>
          <p className="text-2xl font-bold text-gray-600">
            {schedule.event.name}
          </p>
        </div>
        <EventJoinModal
          schedule={{
            schedule: schedule,
            participants: participants,
          }}
        >
          <button type="button" className="flex py-2 pr-4">
            <div className="flex h-auto items-center gap-x-2 rounded-l rounded-r-none border-1 border-[#65D1F8] bg-[#E1F8FE] px-3 py-1 align-middle text-2xl text-[#65D1F8] hover:bg-[#E1F8FE] hover:text-[#65D1F8] dark:bg-[#E1F8FE]">
              <UsersIcon className="h-4 w-4" />
              {participants.participants}/{schedule.event.sizeLimit}
            </div>
            <div className="flex h-auto items-center gap-x-2 rounded-l-none rounded-r border-1 border-[#65D1F8] bg-[#65D1F8] px-3 py-1 align-middle text-2xl text-[#E1F8FE] hover:bg-[#65D1F8] hover:text-[#E1F8FE] dark:bg-[#65D1F8]">
              {scheduleMemberStatusQuery.data.scheduleMemberStatus
                ? scheduleMemberStatusQuery.data.scheduleMemberStatus.status ===
                  "pending"
                  ? "Pending"
                  : "Joined"
                : "Join"}
            </div>
          </button>
        </EventJoinModal>
      </div>
    </div>
  );
}

const paramsType = type({
  scheduleId: "string",
  repeatIndex: "string.integer.parse",
});

export const Route = createFileRoute("/_layout/event/$scheduleId/$repeatIndex")(
  {
    component: EventDetailPage,
    loader: async ({ context: { queryClient }, params }) => {
      const { scheduleId, repeatIndex } = Effect.runSync(
        effectType(paramsType, params),
      );
      queryClient.prefetchQuery(
        getScheduleQueryOptions({ id: scheduleId, repeatIndex }),
      );
      queryClient.prefetchQuery(
        getScheduleMemberListQueryOptions({
          id: scheduleId,
          repeatIndex,
        }),
      );

      return { scheduleId, repeatIndex };
    },
  },
);
