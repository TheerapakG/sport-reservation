// src/routes/event.tsx
import { useGetUserMemberClubListQueryOptions } from "@/api/club";
import ClubListItem from "@/components/club/ClubListItem";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Suspense, useCallback, useEffect, useRef } from "react";

const ClubList = ({ className }: { className?: string }) => {
  const getUserClubMemberListQueryOptions =
    useGetUserMemberClubListQueryOptions();
  const userClubMemberList = useSuspenseQuery(
    getUserClubMemberListQueryOptions,
  );

  const clubsHasNextPage = false;
  const clubsIsFetchingNextPage = false;
  const clubsFetchNextPage = useCallback(() => {}, []);

  const flattenedClubs = userClubMemberList.data?.clubs ?? [];

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: clubsHasNextPage ? flattenedClubs.length + 1 : flattenedClubs.length,
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
        flattenedClubs.length - 1 &&
      clubsHasNextPage &&
      !clubsIsFetchingNextPage
    ) {
      clubsFetchNextPage();
    }
  }, [
    clubsHasNextPage,
    clubsFetchNextPage,
    flattenedClubs.length,
    clubsIsFetchingNextPage,
    virtualItems,
  ]);

  return (
    <main className={className} ref={parentRef}>
      {flattenedClubs.length > 0 || clubsHasNextPage ? (
        <div ref={parentRef} className="overflow-y-auto">
          <div
            className="relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {virtualItems.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > flattenedClubs.length - 1;
              const club = flattenedClubs[virtualRow.index];

              return isLoaderRow ? (
                clubsHasNextPage ? (
                  <div className="text-center text-gray-500">
                    Loading more...
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Nothing more to load
                  </div>
                )
              ) : (
                <ClubListItem key={club.id} club={club} />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No clubs found.</div>
      )}
    </main>
  );
};

function RouteComponent() {
  return (
    <div className="flex h-full flex-col">
      <Suspense
        fallback={
          <main className="flex-1 overflow-auto bg-white p-4">
            <div className="text-center text-gray-500">Loading...</div>
          </main>
        }
      >
        <ClubList className="flex-1 overflow-auto bg-white p-4" />
      </Suspense>
    </div>
  );
}

export const Route = createFileRoute("/_layout/club/user")({
  component: RouteComponent,
  ssr: false,
});
