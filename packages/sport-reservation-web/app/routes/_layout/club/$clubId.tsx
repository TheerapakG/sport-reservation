import { getClubMemberListQueryOptions, getClubQueryOptions } from "@/api/club";
import { getScheduleClubListQueryOptions } from "@/api/event";
import ClubJoinModal from "@/components/club/ClubJoinModal";
import EventListItem from "@/components/event/EventListItem";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { ChevronLeftIcon, PinIcon, UsersIcon } from "lucide-react";
import { effectType } from "tiara-stack/utils/effectType";

const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.navigate({ to: "/club" })}
      className={cn(
        "h-auto rounded border-1 border-[#65D1F8] bg-[#E1F8FE] px-3 py-1 align-middle font-semibold text-[#65D1F8] hover:bg-[#E1F8FE] hover:text-[#65D1F8] dark:bg-[#E1F8FE]",
        className,
      )}
    >
      <ChevronLeftIcon className="h-4 w-4" /> Back to Clubs
    </Button>
  );
};

function EventDetailPage() {
  const { clubId } = Route.useLoaderData();

  const clubQuery = useSuspenseQuery(getClubQueryOptions({ id: clubId }));
  const scheduleQuery = useSuspenseQuery(
    getScheduleClubListQueryOptions({ id: clubId }),
  );

  if (!clubQuery.data.success || !scheduleQuery.data.success) {
    return (
      <div className="flex flex-col gap-y-4 px-8 py-4">
        <BackButton className="h-8 w-36" />
        <p>Club not found!</p>
      </div>
    );
  }

  const { club } = clubQuery.data;
  const { schedules } = scheduleQuery.data;
  return (
    <div className="flex flex-col gap-y-4 px-8 py-4">
      <BackButton className="h-8 w-36" />

      <div className="flex flex-col gap-y-2">
        <h1 className="text-4xl font-bold">{club.name}</h1>
        <div className="flex gap-x-2">
          <UserAvatar profile={club.creator} className="h-12 w-12" />
          <div className="flex flex-col">
            <p className="text-base font-semibold text-gray-500">
              Organized by
            </p>
            <p className="text-base font-semibold">{club.creator.name}</p>
          </div>
        </div>
        <div className="bg-background/95 supports-backdrop-filter:bg-background/60 flex w-full flex-col items-center justify-between gap-y-2 border-t backdrop-blur-sm">
          {schedules.map(({ schedule, participants }) => (
            <EventListItem
              key={schedule.schedule.id}
              schedule={{ schedule, participants }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <img
            src={
              club.image ||
              "https://cdn.theerapakg.moe/reservation/asset/event/badminton-default.jpg"
            }
            alt={club.name}
            className="h-72 rounded object-cover"
          />
        </div>
        <div className="flex flex-col gap-y-4">
          <h1 className="text-2xl font-bold">About us</h1>
          <div className="flex gap-x-2">
            <PinIcon className="h-4 w-4" />
            <p className="text-base">{club.location}</p>
          </div>
          <div className="flex gap-x-2">
            <UsersIcon className="h-4 w-4" />
            <p className="text-base">{club.size}</p>
          </div>
          <p className="text-base">{club.description ?? "No description"}</p>
        </div>
      </div>

      <div className="border-grid bg-background/95 supports-backdrop-filter:bg-background/60 absolute right-0 bottom-0 left-0 z-50 flex w-full items-center justify-between border-t backdrop-blur-sm">
        <div className="flex flex-col py-2 pl-4">
          <p className="text-2xl font-bold text-gray-600">{club.name}</p>
        </div>
        <ClubJoinModal club={club}>
          <button type="button" className="flex py-2 pr-4">
            <div className="flex h-auto items-center gap-x-2 rounded-l rounded-r-none border-1 border-[#65D1F8] bg-[#E1F8FE] px-3 py-1 align-middle text-2xl text-[#65D1F8] hover:bg-[#E1F8FE] hover:text-[#65D1F8] dark:bg-[#E1F8FE]">
              <UsersIcon className="h-4 w-4" />
              {club.size}
            </div>
            <div className="flex h-auto items-center gap-x-2 rounded-l-none rounded-r border-1 border-[#65D1F8] bg-[#65D1F8] px-3 py-1 align-middle text-2xl text-[#E1F8FE] hover:bg-[#65D1F8] hover:text-[#E1F8FE] dark:bg-[#65D1F8]">
              Join
            </div>
          </button>
        </ClubJoinModal>
      </div>
    </div>
  );
}

const paramsType = type({
  clubId: "string",
});

export const Route = createFileRoute("/_layout/club/$clubId")({
  component: EventDetailPage,
  loader: async ({ context: { queryClient }, params }) => {
    const { clubId } = Effect.runSync(effectType(paramsType, params));
    queryClient.prefetchQuery(getClubQueryOptions({ id: clubId }));
    queryClient.prefetchQuery(
      getClubMemberListQueryOptions({
        id: clubId,
      }),
    );

    return { clubId };
  },
});
