import {
  getAllMatchedUsersQueryOptions,
  getMatchingCursorQueryOptions,
  useCreateMatchingCursorMutation,
  useMatchUsersMutation,
} from "@/api/matching";
import { getCurrentUserProfileQueryOptions } from "@/api/user";
import UserCardComponent from "@/components/matching/UserCardComponent";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Effect, Sink, Stream } from "effect";
import { Suspense } from "react";
import { userProfile } from "sport-reservation-user/models";

const exampleUser = {
  name: "Butter Bear",
  avatar: "app/components/Assets/Image/ProfileButterBear.png",
  distance: 2.3,
  sports: ["Badminton", "Tennis"],
  objectives: [
    "Stay active",
    "Just for fun",
    "Meet new friend",
    "Casual match",
  ],
  availability: "Weekends & Evenings",
  locations: ["81 Badminton Court", "Tennis Sport Hub"],
};

const haversineDistance = (
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number],
) => {
  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const dLon = toRadians(lon2 - lon1);
  const dLat = toRadians(lat2 - lat1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return c * 6378137;
};

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
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="relative w-72">
        <UserCardComponent
          user={exampleUser}
          className="absolute top-0 left-0 z-0 -translate-x-3 -rotate-6"
          disabled={true}
        />
        <UserCardComponent
          user={exampleUser}
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

const MatchedUserCardComponent = ({
  currentUser,
  matchedUser,
}: {
  currentUser: typeof userProfile.infer;
  matchedUser: typeof userProfile.infer;
}) => {
  const currentUserLocations = currentUser.locations
    .map(({ location }) => location)
    .filter(Boolean);
  const matchedUserLocations = matchedUser.locations
    .map(({ location }) => location)
    .filter(Boolean);

  const minDistance = Effect.runSync(
    Stream.cross(
      Stream.fromIterable(currentUserLocations),
      Stream.fromIterable(matchedUserLocations),
    ).pipe(
      Stream.map(([currentUserLocation, matchedUserLocation]) =>
        haversineDistance(currentUserLocation, matchedUserLocation),
      ),
      Stream.run(
        Sink.foldLeft(Number.MAX_SAFE_INTEGER, (min, distance) =>
          Math.min(min, distance),
        ),
      ),
    ),
  );

  return (
    <UserCardComponent
      user={{
        name: matchedUser.name,
        avatar: matchedUser.avatar,
        distance: minDistance,
        sports: matchedUser.sports.map((sport) => sport.sportType),
        objectives: matchedUser.objectives.map(
          (objective) => objective.objectiveType,
        ),
        availability: matchedUser.availability,
        locations: matchedUser.locations
          .map((location) => location.locationDescription)
          .filter(Boolean),
      }}
    />
  );
};

const MatchedUsersPage = ({ cursorId }: { cursorId: string }) => {
  const getAllMatchedUsersQuery = useSuspenseQuery(
    getAllMatchedUsersQueryOptions({
      cursorId,
    }),
  );

  const getCurrentUserProfileQuery = useSuspenseQuery(
    getCurrentUserProfileQueryOptions(),
  );

  const matchedUsers = getAllMatchedUsersQuery.data?.matches;
  const currentUser = getCurrentUserProfileQuery.data?.profile;

  return matchedUsers && currentUser && matchedUsers.length > 0 ? (
    <div className="container mx-auto flex min-h-screen flex-wrap items-center justify-center gap-4">
      {matchedUsers.map(({ user }) => (
        <MatchedUserCardComponent
          key={user.id}
          currentUser={currentUser}
          matchedUser={user}
        />
      ))}
    </div>
  ) : (
    <NoCursorMatchingPage />
  );
};

function MatchingPage() {
  const cursorQuery = useSuspenseQuery(getMatchingCursorQueryOptions());

  return cursorQuery.data.success ? (
    <Suspense fallback={<div>Loading...</div>}>
      <MatchedUsersPage cursorId={cursorQuery.data.cursor.cursorId} />
    </Suspense>
  ) : (
    <NoCursorMatchingPage />
  );
}

export const Route = createFileRoute("/_layout/matching/")({
  loader: async ({ context: { queryClient } }) => {
    const matchingCursor = await queryClient.ensureQueryData(
      getMatchingCursorQueryOptions(),
    );
    if (matchingCursor.success) {
      queryClient.prefetchQuery(getCurrentUserProfileQueryOptions());
      queryClient.prefetchQuery(
        getAllMatchedUsersQueryOptions({
          cursorId: matchingCursor.cursor.cursorId,
        }),
      );
    }
  },
  component: MatchingPage,
});
