import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format } from "date-fns";
import { addSeconds } from "date-fns/fp";
import { pipe } from "effect";
import React from "react";
import { scheduleInstanceType } from "sport-reservation-event/models";
import { Button } from "../ui/button";

export default function EventCreatedModal({
  schedule: { schedule, participants },
  children,
  open,
  onOpenChange,
}: {
  schedule: typeof scheduleInstanceType.infer;
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <VisuallyHidden>
        <DialogHeader>
          <DialogTitle>Created event</DialogTitle>
          <DialogDescription>Event created successfully!</DialogDescription>
        </DialogHeader>
      </VisuallyHidden>
      <DialogContent>
        <div className="mt-6 flex flex-col gap-y-2">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-center text-xl font-bold">Congrats!</h1>
            <p className="text-basetext-center text-gray-600">
              Event created successfully!
            </p>
          </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
