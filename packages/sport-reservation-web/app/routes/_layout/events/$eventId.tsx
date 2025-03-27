import {
  getEventMemberListQueryOptions,
  getEventQueryOptions,
} from "@/api/event";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

function EventDetailPage() {
  const { eventId } = Route.useLoaderData();

  const eventQuery = useSuspenseQuery(getEventQueryOptions({ id: eventId }));
  const memberListQuery = useSuspenseQuery(
    getEventMemberListQueryOptions({ id: eventId }),
  );

  if (!eventQuery.data.success) {
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
          {eventQuery.data.event.name}
        </h1>
        <p className="mb-3 text-sm text-gray-500">
          Hosted by {eventQuery.data.event.creator?.name}
        </p>
        <img
          src={eventQuery.data.event.image}
          alt={eventQuery.data.event.name}
          className="mb-4 h-60 w-full rounded object-cover"
        />
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">When</h2>
            <p className="text-sm text-gray-600">
              {eventQuery.data.event.startAt}
            </p>
          </div>
          <div className="mt-4 space-y-1 md:mt-0">
            <h2 className="text-lg font-semibold">Where</h2>
            <p className="text-sm text-gray-600">
              {eventQuery.data.event.locationDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-bold">About</h2>
        <p className="mb-4 text-sm text-gray-700">
          {eventQuery.data.event.description}
        </p>
        <h2 className="mb-2 text-lg font-bold">
          Participants ({eventQuery.data.event.participants}/
          {eventQuery.data.event.sizeLimit})
        </h2>
        <div className="flex items-center space-x-2">
          {memberListQuery.data.members?.slice(0, 4).map((member, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={member.user?.avatar || "https://via.placeholder.com/40"}
                alt={member.user?.name || "User"}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="mt-1 text-xs">{member.user?.name}</span>
            </div>
          ))}
          {eventQuery.data.event.participants > 4 && (
            <p className="text-sm text-gray-600">
              + {eventQuery.data.event.participants - 4} more
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded bg-white p-4 shadow">
        <p className="text-sm text-gray-600">
          {eventQuery.data.event.participants}/{eventQuery.data.event.sizeLimit}{" "}
          joined
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

export const Route = createFileRoute("/_layout/events/$eventId")({
  component: EventDetailPage,
  loader: async ({ context: { queryClient }, params: { eventId } }) => {
    queryClient.prefetchQuery(getEventQueryOptions({ id: eventId }));
    queryClient.prefetchQuery(getEventMemberListQueryOptions({ id: eventId }));

    return { eventId };
  },
});
