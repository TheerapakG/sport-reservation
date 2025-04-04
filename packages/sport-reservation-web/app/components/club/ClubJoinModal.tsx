import { useRequestClubMembershipCreateMutation } from "@/api/club";
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
import React from "react";
import { clubType } from "sport-reservation-club/models";
import { Button } from "../ui/button";

export default function ClubJoinModal({
  club,
  children,
}: {
  club: typeof clubType.infer;
  children: React.ReactNode;
}) {
  const requestClubMembershipCreateMutation =
    useRequestClubMembershipCreateMutation();

  const form = useAppForm({
    onSubmit: async () => {
      await requestClubMembershipCreateMutation.mutateAsync({
        data: {
          clubId: club.id,
        },
      });
    },
  });

  return (
    <Dialog
      onOpenChange={() => {
        form.reset();
        requestClubMembershipCreateMutation.reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <VisuallyHidden>
        <DialogHeader>
          <DialogTitle>Join club</DialogTitle>
          <DialogDescription>
            Join the club to participate with the club's users
          </DialogDescription>
        </DialogHeader>
      </VisuallyHidden>
      <DialogContent>
        <div className="mt-6 flex flex-col gap-y-2">
          {requestClubMembershipCreateMutation.isSuccess && (
            <div className="flex flex-col gap-y-2">
              <h1 className="text-center text-xl font-bold">Congrats!</h1>
              <p className="text-basetext-center text-gray-600">
                You're going to join this club!
              </p>
            </div>
          )}
          <div className="flex gap-x-2 rounded-lg border border-gray-400 p-4">
            <img
              src={
                club.image ??
                "https://cdn.theerapakg.moe/reservation/asset/event/badminton-default.jpg"
              }
              alt={club.name}
              className="h-32 w-48 rounded-md object-cover"
            />
            <div className="flex flex-col gap-y-2">
              <h2 className="text-xl font-semibold">{club.name}</h2>
              <p className="text-base text-gray-600">{club.description}</p>
            </div>
          </div>
          {requestClubMembershipCreateMutation.isSuccess ? (
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
