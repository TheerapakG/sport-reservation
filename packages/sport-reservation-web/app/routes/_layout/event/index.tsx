// src/routes/event.tsx
import { useGetUserMemberClubListQueryOptions } from "@/api/club";
import {
  createEventValidators,
  getScheduleListInfiniteQueryOptions,
  useCreateEventMutation,
  useCreateScheduleMutation,
  useRequestScheduleCreateMutation,
} from "@/api/event";
import Calendar from "@/components/calendar";
import EventListItem from "@/components/event/EventListItem";
import FormHeaderComponent from "@/components/form/FormHeaderComponent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppForm, withForm } from "@/utils/form";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { formOptions, useStore } from "@tanstack/react-form";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type } from "arktype";
import { startOfDay, startOfToday } from "date-fns";
import { formatWithOptions, setHours, setMinutes } from "date-fns/fp";
import { enUS } from "date-fns/locale";
import { Effect, pipe } from "effect";
import { PlusCircle } from "lucide-react";
import { Suspense, useEffect, useRef } from "react";
import { effectType } from "tiara-stack/utils/effectType";
import { typedFormData } from "tiara-stack/utils/formData";

const formOpts = formOptions({
  defaultValues: {
    name: undefined as undefined | string,
    image: undefined as undefined | File,
    description: undefined as undefined | string,
    date: undefined as undefined | Date,
    startTime: [0, 0] as undefined | [number, number],
    endTime: [0, 0] as undefined | [number, number],
    locationDescription: undefined as undefined | string,
    sizeLimit: undefined as undefined | number,
    size: undefined as undefined | number,
    skillLevel: [],
    sportType: [],
    clubId: undefined as undefined | string,
    repeatInterval: 2147483647 as undefined | number,
    repeatEndAt: undefined as undefined | Date,
    autoAccept: false,
  },
});

const eventTypeFormValidators = type({
  sportType: "('badminton' | 'tennis' | 'running')[]",
  skillLevel: "('beginner' | 'intermediate' | 'advanced')[]",
});

const EventTypeForm = withForm({
  ...formOpts,
  render: ({ form }) => {
    return (
      <div className="space-y-6">
        <FormHeaderComponent title="About your event" className="mb-2" />

        <form.AppField
          name="sportType"
          children={(field) => (
            <field.MultipleChoiceField
              label="Select sport type"
              options={[
                { label: "Badminton", value: "badminton" },
                { label: "Tennis", value: "tennis" },
                { label: "Running", value: "running" },
              ]}
            />
          )}
        />

        <form.AppField
          name="skillLevel"
          children={(field) => (
            <field.MultipleChoiceField
              label="Select skill level"
              options={[
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Advanced", value: "advanced" },
              ]}
            />
          )}
        />
      </div>
    );
  },
});

const eventClubFormValidators = type({
  "clubId?": "string",
});

const EventClubForm = withForm({
  ...formOpts,
  render: function Render({ form }) {
    const getUserClubMemberListQueryOptions =
      useGetUserMemberClubListQueryOptions();
    const userClubMemberList = useSuspenseQuery(
      getUserClubMemberListQueryOptions,
    );

    return (
      <div className="space-y-6">
        <FormHeaderComponent title="Select a club" className="mb-2" />

        <form.AppField
          name="clubId"
          children={(field) => (
            <field.ComboBoxField
              options={[
                { label: "None", value: undefined },
                ...(userClubMemberList.data?.clubs ?? []).map((club) => ({
                  label: club.name ?? "Unknown Club",
                  value: club.id,
                })),
              ]}
              placeholder="Select a club"
            />
          )}
        />
      </div>
    );
  },
});

const eventScheduleFormValidators = type([
  {
    repeatInterval: "number",
    repeatEndAt: "Date",
  },
  "|",
  {
    repeatInterval: "2147483647",
    "repeatEndAt?": "Date",
  },
]);

const EventScheduleForm = withForm({
  ...formOpts,
  render: ({ form }) => {
    return (
      <div className="space-y-6">
        <FormHeaderComponent title="Repeat Event" className="mb-2" />

        <form.AppField
          name="repeatInterval"
          children={(field) => (
            <field.ComboBoxField
              label="Repeat Interval"
              placeholder="Select repeat interval"
              options={[
                { label: "None", value: 2147483647 },
                { label: "Every Day", value: 24 * 60 * 60 },
                { label: "Every Week", value: 7 * 24 * 60 * 60 },
                { label: "Every Month", value: 30 * 24 * 60 * 60 },
              ]}
            />
          )}
        />

        <form.AppField
          name="repeatEndAt"
          children={(field) => (
            <field.DatePickerField
              label="End Date"
              placeholder="Select end date"
            />
          )}
        />
      </div>
    );
  },
});

const eventFormModalValidators = eventTypeFormValidators
  .and(eventClubFormValidators)
  .and(eventScheduleFormValidators);

const eventFormValidators = type({
  name: "string",
  image: "File",
  description: "string",
  date: "Date",
  startTime: ["number", "number"],
  endTime: ["number", "number"],
  locationDescription: "string",
  sizeLimit: "number",
  size: "number",
  autoAccept: "boolean",
})
  .and(eventTypeFormValidators)
  .and(eventClubFormValidators)
  .and(eventScheduleFormValidators);

const CreateEventForm = () => {
  const createEventMutation = useCreateEventMutation();
  const createScheduleMutation = useCreateScheduleMutation();
  const requestScheduleCreateMutation = useRequestScheduleCreateMutation();
  const form = useAppForm({
    ...formOpts,
    validators: {
      onChange: eventFormModalValidators,
      onSubmit: eventFormValidators,
    },
    onSubmit: async ({ value }) => {
      const data = await Effect.runPromise(
        effectType(eventFormValidators, value),
      );
      const { event } = await createEventMutation.mutateAsync({
        data: data.clubId
          ? typedFormData(createEventValidators, {
              creatorType: "club",
              clubId: data.clubId,
              name: data.name,
              image: data.image,
              description: data.description,
              location: [0, 0],
              locationDescription: data.locationDescription,
              autoAccept: data.autoAccept,
              sizeLimit: data.sizeLimit,
              skillLevel: data.skillLevel,
              sportType: data.sportType,
            })
          : typedFormData(createEventValidators, {
              creatorType: "user",
              name: data.name,
              image: data.image,
              description: data.description,
              location: [0, 0],
              locationDescription: data.locationDescription,
              autoAccept: data.autoAccept,
              sizeLimit: data.sizeLimit,
              skillLevel: data.skillLevel,
              sportType: data.sportType,
            }),
      });

      if (!event?.eventId) return;

      const startAt = pipe(
        data.date,
        setHours(data.startTime[0]),
        setMinutes(data.startTime[1]),
      );

      const endAt = pipe(
        data.date,
        setHours(data.endTime[0]),
        setMinutes(data.endTime[1]),
      );

      const repeat = data.repeatEndAt
        ? (data.repeatEndAt.getTime() - endAt.getTime()) /
            (data.repeatInterval * 1000) +
          1
        : 1;

      const { schedule } = await createScheduleMutation.mutateAsync({
        data: {
          eventId: event.eventId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          repeat,
          repeatInterval: data.repeatInterval,
        },
      });

      if (!schedule?.scheduleId) return;

      await requestScheduleCreateMutation.mutateAsync({
        data: {
          scheduleId: schedule.scheduleId,
          repeatIndex: 0,
          size: data.size + 1,
        },
      });
    },
  });

  console.log(form.getAllErrors());

  const sizeLimit = useStore(form.store, (state) => state.values.sizeLimit);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col justify-center space-y-4 rounded-xl border-2 border-[#65D1F8] p-2"
      >
        <form.AppField
          name="image"
          children={(field) => (
            <field.FileInputField
              label="Event Picture"
              placeholder="Upload an image"
            />
          )}
        />

        <form.AppField
          name="name"
          children={(field) => (
            <field.TextInputField
              label="Event Name"
              placeholder="e.g. Friendly Football"
              classNames={{
                input: "w-full rounded border-1 border-[#65D1F8]",
              }}
            />
          )}
        />

        <form.AppField
          name="description"
          children={(field) => (
            <field.TextInputField
              label="Description"
              placeholder="Short description..."
              variant="textarea"
              classNames={{
                input: "w-full rounded border-1 border-[#65D1F8]",
              }}
            />
          )}
        />

        <form.AppField
          name="date"
          children={(field) => (
            <field.DatePickerField
              label="Date"
              placeholder="Pick a date"
              classNames={{
                button: "w-full rounded border-1 border-[#65D1F8]",
              }}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <form.AppField
            name="startTime"
            children={(field) => (
              <field.TimePickerField
                label="Start Time"
                placeholder="Pick a time"
                classNames={{
                  button: "w-full rounded border-1 border-[#65D1F8]",
                }}
              />
            )}
          />
          <form.AppField
            name="endTime"
            children={(field) => (
              <field.TimePickerField
                label="End Time"
                placeholder="Pick a time"
                classNames={{
                  button: "w-full rounded border-1 border-[#65D1F8]",
                }}
              />
            )}
          />
        </div>

        <form.AppField
          name="locationDescription"
          children={(field) => (
            <field.TextInputField
              label="Location"
              placeholder="e.g. Google Map link or place"
              classNames={{
                input: "w-full rounded border-1 border-[#65D1F8]",
              }}
            />
          )}
        />

        <form.AppField
          name="sizeLimit"
          children={(field) => (
            <field.NumericInputField
              label="Max Participant"
              placeholder="e.g. 10"
              buttons
              min={1}
              classNames={{
                input: "w-full rounded border-1 border-[#65D1F8]",
              }}
            />
          )}
        />

        <form.AppField
          name="size"
          children={(field) => (
            <field.NumericInputField
              label="Add guests"
              placeholder="e.g. 2"
              buttons
              min={0}
              max={sizeLimit ? sizeLimit - 1 : undefined}
              classNames={{
                input: "w-full rounded border-1 border-[#65D1F8]",
              }}
            />
          )}
        />

        <div className="flex flex-col space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="font-normal text-[#65D1F8]">
                <PlusCircle /> About your event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <VisuallyHidden>
                <DialogHeader>
                  <DialogTitle>Set event type</DialogTitle>
                  <DialogDescription>
                    Select the sport type and skill level for your event
                  </DialogDescription>
                </DialogHeader>
              </VisuallyHidden>
              <EventTypeForm form={form} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-1 text-white hover:opacity-90">
                    Done
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="font-normal text-[#65D1F8]">
                <PlusCircle /> Add this event to the club
              </Button>
            </DialogTrigger>
            <DialogContent>
              <VisuallyHidden>
                <DialogHeader>
                  <DialogTitle>Add this event to the club</DialogTitle>
                  <DialogDescription>
                    Select the club you want to add this event to
                  </DialogDescription>
                </DialogHeader>
              </VisuallyHidden>
              <Suspense fallback={<div>Loading clubs...</div>}>
                <EventClubForm form={form} />
              </Suspense>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-1 text-white hover:opacity-90">
                    Done
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 10) + Repeat Event => popup */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="font-normal text-[#65D1F8]">
                <PlusCircle /> Repeat Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <VisuallyHidden>
                <DialogHeader>
                  <DialogTitle>Repeat Event</DialogTitle>
                  <DialogDescription>
                    Select the repeat interval and end date for your event
                  </DialogDescription>
                </DialogHeader>
              </VisuallyHidden>
              <EventScheduleForm form={form} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-1 text-white hover:opacity-90">
                    Done
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <form.AppField
          name="autoAccept"
          children={(field) => (
            <field.SingleChoiceField
              label="Joining Options"
              options={[
                { label: "Request to Join", value: false },
                { label: "Auto Join", value: true },
              ]}
              classNames={{ button: "rounded w-1/2" }}
              variant="connected"
            />
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
              >
                {isSubmitting ? "Creating..." : "Create Event!"}
              </button>
            </div>
          )}
        />
      </form>
    </>
  );
};

const SidebarCalendarCard = () => {
  const { date } = Route.useLoaderData();
  const defaultedDate = date ?? startOfToday();

  const router = useRouter();

  return (
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
              to: "/event",
              search: { date: startOfDay(date).toISOString() },
            })
          }
          className="flex justify-center rounded-xl border-2 border-[#65D1F8] p-2"
        />
      </CardContent>
    </Card>
  );
};

const SidebarCreateEventCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#F28382]">Create Events</CardTitle>
        <CardDescription>Add a new activity</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateEventForm />
      </CardContent>
    </Card>
  );
};

const Sidebar = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <SidebarCalendarCard />
      <SidebarCreateEventCard />
    </div>
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
    data: schedulesData,
    hasNextPage: schedulesHasNextPage,
    fetchNextPage: schedulesFetchNextPage,
    isFetchingNextPage: schedulesIsFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    getScheduleListInfiniteQueryOptions({
      date: defaultedDate,
      limit: 10,
    }),
  );

  const flattenedSchedules =
    schedulesData?.pages
      ?.filter((page) => page.success)
      .flatMap((page) => page.schedules) ?? [];

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: schedulesHasNextPage
      ? flattenedSchedules.length + 1
      : flattenedSchedules.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 184,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (virtualItems.length === 0) {
      return;
    }

    if (
      virtualItems[virtualItems.length - 1].index >=
        flattenedSchedules.length - 1 &&
      schedulesHasNextPage &&
      !schedulesIsFetchingNextPage
    ) {
      schedulesFetchNextPage();
    }
  }, [
    schedulesHasNextPage,
    schedulesFetchNextPage,
    flattenedSchedules.length,
    schedulesIsFetchingNextPage,
    virtualItems,
  ]);

  return (
    <div className={className}>
      {flattenedSchedules.length > 0 || schedulesHasNextPage ? (
        <div
          ref={parentRef}
          className="flex h-full flex-col gap-y-4 overflow-y-auto"
        >
          <div
            className="relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow) => {
              const isLoaderRow =
                virtualRow.index > flattenedSchedules.length - 1;
              const { schedule, participants } =
                flattenedSchedules[virtualRow.index];

              return isLoaderRow ? (
                schedulesHasNextPage ? (
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
                  key={schedule.schedule.id}
                  schedule={{ schedule, participants }}
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
    </div>
  );
};

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden md:h-full md:flex-row">
      <Sidebar className="h-full w-full space-y-8 overflow-y-auto p-4 md:max-w-96" />
      <Suspense
        fallback={
          <div className="flex-1 overflow-auto bg-white p-4">
            <div className="text-center text-gray-500">Loading...</div>
          </div>
        }
      >
        <EventList className="h-full flex-1 overflow-y-auto bg-white p-4" />
      </Suspense>
    </div>
  );
}

const validateSearch = type({ "date?": "string.date.parse" });

export const Route = createFileRoute("/_layout/event/")({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps: { date } }) => {
    if (date) {
      queryClient.prefetchInfiniteQuery(
        getScheduleListInfiniteQueryOptions({
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
