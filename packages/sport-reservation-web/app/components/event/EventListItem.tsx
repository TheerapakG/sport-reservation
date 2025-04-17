// src/components/EventListing.tsx
import { useGetScheduleMemberStatusQueryOptions } from "@/api/event";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router"; // Import Link from TanStack Router
import { format } from "date-fns";
import { addSeconds } from "date-fns/fp";
import { pipe } from "effect";
import { MapPin, UsersIcon } from "lucide-react"; // or your icon library
import { Suspense } from "react";
import { scheduleInstanceType } from "sport-reservation-event/models";
import EventJoinModal from "./EventJoinModal";

const EventJoinButton = ({
  schedule: { schedule, participants },
}: {
  schedule: typeof scheduleInstanceType.infer;
}) => {
  const getScheduleMemberStatusQueryOptions =
    useGetScheduleMemberStatusQueryOptions({
      id: schedule.schedule.id,
    });
  const scheduleMemberStatus = useSuspenseQuery(
    getScheduleMemberStatusQueryOptions,
  );

  return (
    <div>
      <EventJoinModal schedule={{ schedule, participants }}>
        <button
          type="button"
          className="flex py-2 pr-4"
          disabled={
            scheduleMemberStatus.data.scheduleMemberStatus !== undefined
          }
        >
          <div className="flex h-auto items-center gap-x-2 rounded-l rounded-r-none border-1 border-[#65D1F8] bg-[#E1F8FE] px-3 py-1 align-middle text-sm text-[#65D1F8] hover:bg-[#E1F8FE] hover:text-[#65D1F8] dark:bg-[#E1F8FE]">
            <UsersIcon className="h-4 w-4" />
            {participants.participants}/{schedule.event.sizeLimit}
          </div>
          <div className="flex h-auto items-center gap-x-2 rounded-l-none rounded-r border-1 border-[#65D1F8] bg-[#65D1F8] px-3 py-1 align-middle text-sm text-[#E1F8FE] hover:bg-[#65D1F8] hover:text-[#E1F8FE] dark:bg-[#65D1F8]">
            {scheduleMemberStatus.data.scheduleMemberStatus
              ? scheduleMemberStatus.data.scheduleMemberStatus.status ===
                "pending"
                ? "Pending"
                : "Joined"
              : schedule.event.autoAccept
                ? "Join"
                : "Request to Join"}
          </div>
        </button>
      </EventJoinModal>
    </div>
  );
};

export default function EventListItem({
  schedule: { schedule, participants },
}: {
  schedule: typeof scheduleInstanceType.infer;
}) {
  const actualStartAt = pipe(
    schedule.schedule.startAt,
    addSeconds(participants.repeatIndex * schedule.schedule.repeatInterval),
  );
  const actualEndAt = pipe(
    schedule.schedule.endAt,
    addSeconds(participants.repeatIndex * schedule.schedule.repeatInterval),
  );

  return (
    <div className="flex space-x-4 rounded-md bg-white p-4 shadow">
      <Link
        to={`/event/$scheduleId/$repeatIndex`}
        params={{
          scheduleId: schedule.schedule.id,
          repeatIndex: participants.repeatIndex.toString(),
        }}
      >
        <img
          src={
            schedule.event.image ??
            "https://cdn.theerapakg.moe/reservation/asset/event/badminton-default.jpg"
          }
          alt={schedule.event.name}
          className="h-32 w-48 rounded-md object-cover"
        />
      </Link>

      <div className="flex w-full flex-col justify-between">
        <Link
          to={`/event/$scheduleId/$repeatIndex`}
          params={{
            scheduleId: schedule.schedule.id,
            repeatIndex: participants.repeatIndex.toString(),
          }}
          className="flex w-full flex-col justify-between"
        >
          <p className="text-sm text-[#F28382]">
            {format(actualStartAt, "EEEE PPP")} (
            {format(actualStartAt, "HH:mm")} - {format(actualEndAt, "HH:mm")})
          </p>
          <p className="text-xl font-semibold">{schedule.event.name}</p>
          <p className="text-sm text-gray-600">{schedule.event.description}</p>
          <p className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-1" />
            {schedule.event.locationDescription}
          </p>
        </Link>
        <Suspense fallback={<Skeleton className="h-4 w-36" />}>
          <EventJoinButton schedule={{ schedule, participants }} />
        </Suspense>
      </div>
    </div>
  );
}
