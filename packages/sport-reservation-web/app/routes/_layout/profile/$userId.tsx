import { getUserMemberClubCountQueryOptions } from "@/api/club";
import { getUserMemberSchedulesCountQueryOptions } from "@/api/event";
import { getUserProfileQueryOptions } from "@/api/user";
import UserCardComponent from "@/components/profile/UserCardComponent";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { Effect } from "effect";
import { effectType } from "tiara-stack/utils/effectType";

function IndexComponent() {
  const { userId } = Route.useLoaderData();

  const userProfileQueryOptions = getUserProfileQueryOptions({ id: userId });
  const userProfileQuery = useSuspenseQuery(userProfileQueryOptions);
  const userMemberClubCountQueryOptions = getUserMemberClubCountQueryOptions({
    id: userId,
  });
  const userMemberClubCountQuery = useSuspenseQuery(
    userMemberClubCountQueryOptions,
  );
  const userMemberSchedulesCountQueryOptions =
    getUserMemberSchedulesCountQueryOptions({ id: userId });
  const userMemberSchedulesCountQuery = useSuspenseQuery(
    userMemberSchedulesCountQueryOptions,
  );

  if (
    !userProfileQuery.data?.profile ||
    !userMemberClubCountQuery.data?.count ||
    !userMemberSchedulesCountQuery.data?.count
  ) {
    return <div>No profile found</div>;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-y-4 p-4">
      <div className="flex items-center justify-center gap-x-8">
        <UserCardComponent
          user={userProfileQuery.data.profile}
          clubCount={userMemberClubCountQuery.data.count}
          scheduleCount={userMemberSchedulesCountQuery.data.count}
        />
        <div className="flex w-96 flex-col gap-y-4"></div>
      </div>
    </div>
  );
}

const paramsType = type({
  userId: "string",
});

export const Route = createFileRoute("/_layout/profile/$userId")({
  component: IndexComponent,
  loader: async ({ context: { queryClient }, params }) => {
    const { userId } = Effect.runSync(effectType(paramsType, params));
    queryClient.prefetchQuery(getUserProfileQueryOptions({ id: userId }));
    queryClient.prefetchQuery(
      getUserMemberClubCountQueryOptions({
        id: userId,
      }),
    );
    queryClient.prefetchQuery(
      getUserMemberSchedulesCountQueryOptions({
        id: userId,
      }),
    );

    return { userId };
  },
});
