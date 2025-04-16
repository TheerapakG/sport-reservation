import {
  getAllMatchedUsersQueryOptions,
  getGeneralAssessmentV1ListQueryOptions,
  useCreateMatchingCursorMutation,
  useGetMatchingCursorQueryOptions,
  useMatchUsersMutation,
} from "@/api/matching";
import { currentUserProfileQueryOptions } from "@/api/oauth";
import MatchingCardComponent from "@/components/matching/MatchingCardComponent";
import { MatchFilterModal } from "@/components/modal/MatchFilterModal";
import { SubscriptionModal } from "@/components/modal/SubscriptionModal";
import { useAppForm } from "@/utils/form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SlidersHorizontalIcon } from "lucide-react";
import { Suspense } from "react";
import { userProfile } from "sport-reservation-user/models";

const useExampleUser = () =>
  ({
    id: "1",
    name: "Butter Bear",
    avatar:
      "https://cdn.theerapakg.moe/reservation/user/avatar/butter-bear.png",
    membership: "free",
    sports: [
      { sportId: "1", sportType: "badminton" },
      { sportId: "2", sportType: "tennis" },
    ],
    objectives: [
      { objectiveId: "1", objectiveType: "train_improve" },
      { objectiveId: "2", objectiveType: "just_for_fun" },
      { objectiveId: "3", objectiveType: "meet_new_friends" },
      { objectiveId: "4", objectiveType: "casual_matches" },
    ],
    availability: "Weekends & Evenings",
    locations: [
      { locationId: "1", locationDescription: "81 Badminton Court" },
      { locationId: "2", locationDescription: "Tennis Sport Hub" },
    ],
  }) satisfies typeof userProfile.infer;

const MatchingButton = () => {
  const user = useSuspenseQuery(currentUserProfileQueryOptions());

  const createMatchingCursorMutation = useCreateMatchingCursorMutation();
  const matchUsersMutation = useMatchUsersMutation();

  const form = useAppForm({
    defaultValues: {
      radius: 8,
      ageRange: [22, 27],
      gender: [] as ("male" | "female" | "prefer_not_to_say")[],
      objectives: [] as ("casual" | "competitive" | "fitness")[],
    },
    onSubmit: async ({ value, formApi }) => {
      await createMatchingCursorMutation.mutateAsync(
        {
          data: formApi.state.isDirty
            ? {
                minAge: value.ageRange[0],
                maxAge: value.ageRange[1],
                gender: value.gender,
                objectiveCategory: value.objectives,
              }
            : { gender: [], objectiveCategory: [] },
        },
        {
          onSuccess: (cursor) => {
            if (cursor.success) {
              matchUsersMutation.mutate({
                data: { cursorId: cursor.cursor.cursorId },
              });
            }
          },
        },
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="mt-4 flex justify-center gap-0.5">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-l-md bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              {isSubmitting ? "Matching..." : "Match now!"}
            </button>
          )}
        />
        {(user.data?.profile?.membership ?? "free" === "free") ? (
          <SubscriptionModal>
            <button
              type="button"
              className="rounded-r-md bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              <SlidersHorizontalIcon className="h-4 w-4" />
            </button>
          </SubscriptionModal>
        ) : (
          <MatchFilterModal form={form}>
            <button
              type="button"
              className="rounded-r-md bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 font-semibold text-white hover:opacity-90"
            >
              <SlidersHorizontalIcon className="h-4 w-4" />
            </button>
          </MatchFilterModal>
        )}
      </div>
    </form>
  );
};

const NoCursorMatchingPage = () => {
  const exampleUser = useExampleUser();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="relative w-72">
        <MatchingCardComponent
          user={exampleUser}
          matchedUser={exampleUser}
          className="absolute top-0 left-0 z-0 -translate-x-3 -rotate-6"
          disabled={true}
        />
        <MatchingCardComponent
          user={exampleUser}
          matchedUser={exampleUser}
          className="z-10"
          disabled={true}
        />
      </div>

      <div className="mx-auto mt-8 max-w-2xl text-center">
        <h3 className="mb-2 text-xl font-semibold">
          The easiest way to your next buddy!
        </h3>
        <p className="text-lg text-gray-700">
          Our advanced system analyzes your skill data, physical activity, and
          preferences.
        </p>
        <p className="text-lg text-gray-700">
          So you can find your perfect partner without scrolling.
        </p>
      </div>

      <MatchingButton />
    </div>
  );
};

const MatchedUsersPage = ({ cursorId }: { cursorId: string }) => {
  const getAllMatchedUsersQuery = useSuspenseQuery(
    getAllMatchedUsersQueryOptions({
      cursorId,
    }),
  );

  const matchedUsers = getAllMatchedUsersQuery.data?.matches;

  return matchedUsers && matchedUsers.length > 0 ? (
    <div className="container mx-auto flex min-h-screen flex-wrap items-center justify-center gap-4">
      {matchedUsers.map(({ user }) => (
        <MatchingCardComponent key={user.id} matchedUser={user} />
      ))}
    </div>
  ) : (
    <NoCursorMatchingPage />
  );
};

function MatchingPage() {
  const matchingCursorQueryOptions = useGetMatchingCursorQueryOptions();
  const cursorQuery = useSuspenseQuery(matchingCursorQueryOptions);

  return cursorQuery.data?.cursor ? (
    <Suspense fallback={<div>Loading...</div>}>
      <MatchedUsersPage cursorId={cursorQuery.data.cursor.cursorId} />
    </Suspense>
  ) : (
    <NoCursorMatchingPage />
  );
}

export const Route = createFileRoute("/_layout/matching/")({
  component: MatchingPage,
  loader: async ({ context: { queryClient } }) => {
    const { assessments } = await queryClient.fetchQuery(
      getGeneralAssessmentV1ListQueryOptions(),
    );

    if ((assessments?.length ?? 0) === 0) {
      return redirect({ to: "/assessment/ipaq" });
    }
  },
});
