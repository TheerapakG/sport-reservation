import { useRequestScheduleCreateMutation } from "@/api/event";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppForm } from "@/utils/form";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { type } from "arktype";
import { format } from "date-fns";
import { addSeconds } from "date-fns/fp";
import { pipe } from "effect";
import React from "react";
import { scheduleInstanceType } from "sport-reservation-event/models";
import { Button } from "../ui/button";

export default function EventJoinModal({
  schedule: { schedule, participants },
  children,
}: {
  schedule: typeof scheduleInstanceType.infer;
  children: React.ReactNode;
}) {
  const requestScheduleCreateMutation = useRequestScheduleCreateMutation();

  const actualStartAt = pipe(
    schedule.schedule.startAt,
    addSeconds(participants.repeatIndex * schedule.schedule.repeatInterval),
  );
  const actualEndAt = pipe(
    schedule.schedule.endAt,
    addSeconds(participants.repeatIndex * schedule.schedule.repeatInterval),
  );

  const form = useAppForm({
    defaultValues: {
      size: 0,
    },
    validators: {
      onSubmit: type("number >= 0"),
    },
    onSubmit: async ({ value }) => {
      await requestScheduleCreateMutation.mutateAsync({
        data: {
          scheduleId: schedule.schedule.id,
          repeatIndex: participants.repeatIndex,
          size: value.size + 1,
        },
      });
    },
  });

  return (
    <Dialog
      onOpenChange={() => {
        form.reset();
        requestScheduleCreateMutation.reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <VisuallyHidden>
        <DialogHeader>
          <DialogTitle>Add guests</DialogTitle>
          <DialogDescription>
            Select the number of guests you are bringing with
          </DialogDescription>
        </DialogHeader>
      </VisuallyHidden>
      <DialogContent>
        <div className="mt-6 flex flex-col gap-y-2">
          {requestScheduleCreateMutation.isSuccess && (
            <div className="flex flex-col gap-y-2">
              <h1 className="text-center text-xl font-bold">Congrats!</h1>
              <p className="text-basetext-center text-gray-600">
                You're going to this event!
              </p>
            </div>
          )}
          <div className="flex gap-x-2 rounded-lg border border-gray-400 p-4">
            <img
              src={
                schedule.event.image ??
                "https://cdn.theerapakg.moe/reservation/asset/event/badminton-default.jpg"
              }
              alt={schedule.event.name}
              className="h-32 w-48 rounded-md object-cover"
            />
            <div className="flex flex-col gap-y-2">
              <h2 className="text-xl font-semibold">{schedule.event.name}</h2>
              <p className="text-base text-gray-600">
                {format(actualStartAt, "EEEE PPP HH:mm")} -{" "}
                {format(actualEndAt, "EEEE PPP HH:mm")}
              </p>
            </div>
          </div>
          {requestScheduleCreateMutation.isSuccess ? (
            <div className="mt-6 flex justify-center space-x-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-1 text-white hover:opacity-90"
                >
                  Close
                </Button>
              </DialogClose>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <form.AppField
                name="size"
                children={(field) => (
                  <field.NumericInputField
                    label="Are you bringing anyone?"
                    buttons
                    min={0}
                    classNames={{
                      label: "text-lg text-center",
                      input: "w-24",
                      container: "justify-self-center",
                    }}
                  />
                )}
              />

              <div className="mt-6 flex justify-center space-x-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    className="rounded bg-white px-4 py-2 text-black hover:bg-gray-100"
                  >
                    Close
                  </Button>
                </DialogClose>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
                    >
                      {isSubmitting ? "Joining..." : "Confirm"}
                    </Button>
                  )}
                />
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
