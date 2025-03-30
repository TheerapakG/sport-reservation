import {
  getScheduleMemberListQueryOptions,
  getScheduleQueryOptions,
} from "@/api/event";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { effectType } from "tiara-stack/utils/effectType";

function EventDetailPage() {
  const { scheduleId, repeatIndex } = Route.useLoaderData();

  const scheduleQuery = useSuspenseQuery(
    getScheduleQueryOptions({ id: scheduleId }),
  );
  const memberListQuery = useSuspenseQuery(
    getScheduleMemberListQueryOptions({ id: scheduleId, repeatIndex }),
  );

  if (!scheduleQuery.data.success) {
    return <div className="p-4">Event not found!</div>;
  }

  function handleJoin() {
    alert("Join flow triggered!");
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link to="/events" className="mb-4 inline-block text-blue-500 underline">
        &larr; Back to Events
      </Link>

      <div className="mb-4 rounded bg-white p-4 shadow">
        <h1 className="mb-1 text-2xl font-bold">
          {scheduleQuery.data.schedule.group.name}
        </h1>
        <p className="mb-3 text-sm text-gray-500">
          Hosted by {scheduleQuery.data.schedule.event.creator?.name}
        </p>
        <img
          src={
            scheduleQuery.data.schedule.event.image ||
            "https://via.placeholder.com/40"
          }
          alt={scheduleQuery.data.schedule.event.creator?.name}
          className="mb-4 h-60 w-full rounded object-cover"
        />
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">When</h2>
            <p className="text-sm text-gray-600">
              {scheduleQuery.data.schedule.schedule.startAt.toLocaleString()}
            </p>
          </div>
          <div className="mt-4 space-y-1 md:mt-0">
            <h2 className="text-lg font-semibold">Where</h2>
            <p className="text-sm text-gray-600">
              {scheduleQuery.data.schedule.event.locationDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-bold">About</h2>
        <p className="mb-4 text-sm text-gray-700">
          {scheduleQuery.data.schedule.event.description}
        </p>
        <h2 className="mb-2 text-lg font-bold">
          Participants ({scheduleQuery.data.schedule.participants}/
          {scheduleQuery.data.schedule.event.sizeLimit})
        </h2>
        <div className="flex items-center space-x-2">
          {memberListQuery.data.members
            ?.filter(Boolean)
            .slice(0, 4)
            .map((member, index) => (
              <div key={index} className="flex flex-col items-center">
                <img
                  src={member.user?.avatar || "https://via.placeholder.com/40"}
                  alt={member.user?.name || "User"}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="mt-1 text-xs">{member.user?.name}</span>
              </div>
            ))}
          {scheduleQuery.data.schedule.participants > 4 && (
            <p className="text-sm text-gray-600">
              + {scheduleQuery.data.schedule.participants - 4} more
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded bg-white p-4 shadow">
        <p className="text-sm text-gray-600">
          {scheduleQuery.data.schedule.participants}/
          {scheduleQuery.data.schedule.event.sizeLimit} joined
        </p>
        <button
          onClick={handleJoin}
          className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
        >
          Join
        </button>
      </div>
    </div>
  );
}

const paramsType = type({
  scheduleId: "string",
  repeatIndex: "string.integer.parse",
});

export const Route = createFileRoute(
  "/_layout/events/$scheduleId/$repeatIndex",
)({
  component: EventDetailPage,
  loader: async ({ context: { queryClient }, params }) => {
    const { scheduleId, repeatIndex } = Effect.runSync(
      effectType(paramsType, params),
    );
    queryClient.prefetchQuery(getScheduleQueryOptions({ id: scheduleId }));
    queryClient.prefetchQuery(
      getScheduleMemberListQueryOptions({
        id: scheduleId,
        repeatIndex,
      }),
    );

    return { scheduleId, repeatIndex };
  },
});
