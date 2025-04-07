import {
  getAllMatchedUsersQueryOptions,
  useCreateMatchingCursorMutation,
  useGetMatchingCursorQueryOptions,
  useMatchUsersMutation,
} from "@/api/matching";
import MatchingCardComponent from "@/components/matching/MatchingCardComponent";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { userProfile } from "sport-reservation-user/models";

const useExampleUser = () =>
  ({
    id: "1",
    name: "Butter Bear",
    avatar: "app/components/Assets/Image/ProfileButterBear.png",
    membership: "free",
    sports: [
      { sportId: "1", sportType: "badminton" },
      { sportId: "2", sportType: "tennis" },
    ],
    objectives: [
      { objectiveId: "1", objectiveType: "stay_active" },
      { objectiveId: "2", objectiveType: "for_fun" },
      { objectiveId: "3", objectiveType: "meet_new_friends" },
      { objectiveId: "4", objectiveType: "casual_match" },
    ],
    availability: "Weekends & Evenings",
    locations: [
      { locationId: "1", locationDescription: "81 Badminton Court" },
      { locationId: "2", locationDescription: "Tennis Sport Hub" },
    ],
  }) satisfies typeof userProfile.infer;

const MatchingButton = () => {
  const createMatchingCursorMutation = useCreateMatchingCursorMutation();
  const matchUsersMutation = useMatchUsersMutation();

  return (
    <>
      <Button
        onClick={() => {
          createMatchingCursorMutation.mutate(undefined, {
            onSuccess: (cursor) => {
              if (cursor.success) {
                matchUsersMutation.mutate({
                  cursorId: cursor.cursor.cursorId,
                });
              }
            },
          });
        }}
        className="mt-6 bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-600"
      >
        Match now!
      </Button>
    </>
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
});
