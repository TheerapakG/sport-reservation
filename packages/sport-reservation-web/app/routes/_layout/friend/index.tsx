import { getFriendListInfiniteQueryOptions } from "@/api/friend";
import UserCardComponent from "@/components/profile/UserCardComponent";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Array } from "effect";
import { useEffect, useRef } from "react";

function IndexComponent() {
  const {
    data: friendsData,
    hasNextPage: friendsHasNextPage,
    fetchNextPage: friendsFetchNextPage,
    isFetchingNextPage: friendsIsFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    getFriendListInfiniteQueryOptions({
      limit: 10,
    }),
  );

  const flattenedFriends = Array.chunksOf(
    friendsData?.pages
      ?.filter((page) => page.success)
      .flatMap((page) => page.friends)
      .filter((friend) => friend.user !== undefined) ?? [],
    4,
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: friendsHasNextPage
      ? flattenedFriends.length + 1
      : flattenedFriends.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 356,
    overscan: 2,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (virtualItems.length === 0) {
      return;
    }

    if (
      virtualItems[virtualItems.length - 1].index >=
        flattenedFriends.length - 1 &&
      friendsHasNextPage &&
      !friendsIsFetchingNextPage
    ) {
      friendsFetchNextPage();
    }
  }, [
    friendsHasNextPage,
    friendsFetchNextPage,
    flattenedFriends.length,
    friendsIsFetchingNextPage,
    virtualItems,
  ]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center gap-y-4 p-4"
      ref={parentRef}
    >
      {flattenedFriends.length > 0 || friendsHasNextPage ? (
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
                virtualRow.index > flattenedFriends.length - 1;
              const friendRow = flattenedFriends[virtualRow.index];

              return isLoaderRow ? (
                friendsHasNextPage ? (
                  <div className="text-center text-gray-500">
                    Loading more...
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Nothing more to load
                  </div>
                )
              ) : (
                <div className="flex flex-wrap justify-start gap-x-4">
                  {friendRow.map((friend) => (
                    <UserCardComponent
                      key={friend.user!.id}
                      user={friend.user!}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No friends found.</div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_layout/friend/")({
  component: IndexComponent,
});
