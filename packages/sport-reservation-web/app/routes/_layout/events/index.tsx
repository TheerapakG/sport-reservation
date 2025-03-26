// src/routes/events.tsx
import { getEventListInfiniteQueryOptions } from "@/api/event";
import Calendar from "@/components/calendar";
import CreateEventForm from "@/components/create-events";
import EventListing from "@/components/eventlisting";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import dayjs from "dayjs";
import { Effect } from "effect";
import { effectTypeCheck } from "tiara-stack/utils/effectType";

function RouteComponent() {
  const { date } = Route.useLoaderData();

  const router = useRouter();

  const selectedDateStr = dayjs(date).format("YYYY-MM-DD");

  const events = useInfiniteQuery(
    getEventListInfiniteQueryOptions({
      date,
      limit: 10,
    }),
  );

  const flattenedEvents =
    events.data?.pages
      ?.filter((page) => page.success)
      .flatMap((page) => page.events) ?? [];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN (Sidebar) */}
        <aside className="w-96 space-y-8 overflow-auto bg-gray-50 p-4">
          {/* Calendar Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#F28382]">Calendar</CardTitle>
              <CardDescription>Select a date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
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
            <CardHeader className="p-2">
              {/* The CreateEventForm includes its own heading */}
            </CardHeader>
            <CardContent className="p-2">
              <CreateEventForm />
            </CardContent>
          </Card>
        </aside>

        {/* RIGHT COLUMN (Event Listing) */}
        <main className="flex-1 overflow-auto bg-white p-4">
          {flattenedEvents.length > 0 ? (
            flattenedEvents.map((event) => (
              <EventListing
                key={event.eventId}
                eventId={event.eventId}
                name={event.name}
                dateTime={event.startAt}
                description={event.description}
                locationDescription={event.locationDescription}
                participants={event.participants}
              />
            ))
          ) : (
            <div className="text-center text-gray-500">
              No events found for {selectedDateStr}.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const validateSearch = type({ "date?": "string.date.parse" });

export const Route = createFileRoute("/_layout/events/")({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    const { date } = Effect.runSync(effectTypeCheck(deps));
    const defaultedDate = date ?? new Date();

    queryClient.prefetchInfiniteQuery(
      getEventListInfiniteQueryOptions({
        date: defaultedDate,
        limit: 10,
      }),
    );

    return { date: defaultedDate };
  },
  component: RouteComponent,
});
