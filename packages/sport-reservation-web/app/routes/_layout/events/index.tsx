// src/routes/events.tsx
import { getEventListInfiniteQueryOptions } from "@/api/event";
import Calendar from "@/components/calendar";
import CreateEventForm from "@/components/create-events";
import EventListItem from "@/components/event/EventListItem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type } from "arktype";
import { startOfToday } from "date-fns";
import { formatWithOptions } from "date-fns/fp";
import { enUS } from "date-fns/locale";
import { Suspense, useEffect, useRef } from "react";

const Sidebar = ({ className }: { className?: string }) => {
  const { date } = Route.useLoaderData();
  const defaultedDate = date ?? startOfToday();

  const router = useRouter();

  return (
    <aside className={className}>
      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#F28382]">Calendar</CardTitle>
          <CardDescription>Select a date</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={defaultedDate}
            onSelect={(date) =>
              date &&
              router.navigate({
                to: "/events",
                search: { date: date.toISOString() },
              })
            }
            className="flex justify-center rounded-xl border-2 border-[#65D1F8] p-2"
          />
        </CardContent>
      </Card>

      {/* Create Events Card */}
      <Card className="overflow-hidden rounded-2xl bg-white p-2">
        <CardHeader>
          <CardTitle className="text-[#F28382]">Create Events</CardTitle>
          <CardDescription>Add a new activity</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateEventForm />
        </CardContent>
      </Card>
    </aside>
  );
};

const EventList = ({ className }: { className?: string }) => {
  const { date } = Route.useLoaderData();
  const defaultedDate = date ?? startOfToday();

  const selectedDateStr = formatWithOptions(
    { locale: enUS },
    "yyyy-MM-dd",
    defaultedDate,
  );

  const {
    data: eventsData,
    hasNextPage: eventsHasNextPage,
    fetchNextPage: eventsFetchNextPage,
    isFetchingNextPage: eventsIsFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    getEventListInfiniteQueryOptions({
      date: defaultedDate,
      limit: 10,
    }),
  );

  const flattenedEvents =
    eventsData?.pages
      ?.filter((page) => page.success)
      .flatMap((page) => page.events) ?? [];
  const flattenedEventsLength = flattenedEvents.length;

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: eventsHasNextPage
      ? flattenedEventsLength + 1
      : flattenedEventsLength,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 184,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= flattenedEventsLength - 1 &&
      eventsHasNextPage &&
      !eventsIsFetchingNextPage
    ) {
      eventsFetchNextPage();
    }
  }, [
    eventsHasNextPage,
    eventsFetchNextPage,
    flattenedEventsLength,
    eventsIsFetchingNextPage,
    virtualItems,
  ]);

  return (
    <main className={className} ref={parentRef}>
      {flattenedEvents.length > 0 || eventsHasNextPage ? (
        <div ref={parentRef} className="overflow-y-auto">
          <div
            className="relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > flattenedEvents.length - 1;
              const event = flattenedEvents[virtualRow.index];

              return isLoaderRow ? (
                eventsHasNextPage ? (
                  <div className="text-center text-gray-500">
                    Loading more...
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Nothing more to load
                  </div>
                )
              ) : (
                <EventListItem
                  key={event.eventId}
                  eventId={event.eventId}
                  name={event.name}
                  dateTime={event.startAt}
                  description={event.description}
                  locationDescription={event.locationDescription}
                  participants={event.participants}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No events found for {selectedDateStr}.
        </div>
      )}
    </main>
  );
};

function RouteComponent() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar className="w-96 space-y-8 overflow-auto bg-gray-50 p-4" />
        <Suspense
          fallback={
            <main className="flex-1 overflow-auto bg-white p-4">
              <div className="text-center text-gray-500">Loading...</div>
            </main>
          }
        >
          <EventList className="flex-1 overflow-auto bg-white p-4" />
        </Suspense>
      </div>
    </div>
  );
}

const validateSearch = type({ "date?": "string.date.parse" });

export const Route = createFileRoute("/_layout/events/")({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps: { date } }) => {
    if (date) {
      queryClient.prefetchInfiniteQuery(
        getEventListInfiniteQueryOptions({
          date,
          limit: 10,
        }),
      );
    }

    return { date };
  },
  component: RouteComponent,
  ssr: false,
});
