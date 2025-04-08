import { getCurrentUserProfileQueryOptions } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { objectives } from "@/utils/lookup/objective";
import { sports } from "@/utils/lookup/sport";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Effect, HashSet, Sink, Stream } from "effect";
import { motion } from "framer-motion";
import { useState } from "react";
import { userProfile } from "sport-reservation-user/models";

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

const InternalMatchingCardComponent = ({
  user,
  matchedUser,
  className,
  flipped = false,
  onFlipped,
  disabled,
}: {
  user: typeof userProfile.infer;
  matchedUser: typeof userProfile.infer;
  className?: string;
  flipped?: boolean;
  onFlipped?: (flipped: boolean) => void;
  disabled?: boolean;
}) => {
  const [previousFlipped, setPreviousFlipped] = useState(flipped);
  const [flippedState, setFlippedState] = useState(flipped);

  if (previousFlipped !== flipped) {
    setPreviousFlipped(flipped);
    setFlippedState(flipped);
  }

  const userLocations = user
    ? user.locations.map(({ location }) => location).filter(Boolean)
    : [];
  const matchedUserLocations = matchedUser.locations
    .map(({ location }) => location)
    .filter(Boolean);

  const minDistance = Effect.runSync(
    Stream.cross(
      Stream.fromIterable(userLocations),
      Stream.fromIterable(matchedUserLocations),
    ).pipe(
      Stream.map(([userLocation, matchedUserLocation]) =>
        haversineDistance(userLocation, matchedUserLocation),
      ),
      Stream.run(
        Sink.foldLeft(Number.MAX_SAFE_INTEGER, (min, distance) =>
          Math.min(min, distance),
        ),
      ),
    ),
  );

  const commonSportsSet = HashSet.intersection(
    HashSet.fromIterable(
      (user?.sports ?? []).map(({ sportType }) => sportType),
    ),
  )(HashSet.fromIterable(matchedUser.sports.map(({ sportType }) => sportType)));

  const commonSports = [...HashSet.values(commonSportsSet)];

  const handleFlipped = () => {
    (onFlipped ?? setFlippedState)(!flippedState);
  };

  return (
    <div
      className={cn("relative h-[480px] w-72 [perspective:1000px]", className)}
    >
      <motion.div
        className="h-full [transform-style:preserve-3d]"
        initial={{ rotateY: flipped ? 180 : 0 }}
        animate={{ rotateY: flippedState ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="flex h-full w-full rotate-y-0 flex-col rounded-2xl border-[#65D1F8] p-4 shadow-lg [backface-visibility:hidden]">
          <img
            src={matchedUser.avatar}
            alt={matchedUser.name}
            className="h-72 w-full rounded-lg object-cover"
          />
          <div className="flex flex-grow flex-col justify-between pt-3 text-left">
            <div>
              <h3 className="text-xl font-bold">{matchedUser.name}</h3>
              <p className="mt-1 text-sm text-gray-600">Common Sports:</p>
              <div className="mt-1.5 flex flex-wrap gap-0.5">
                {commonSports.map((sportType) => {
                  const icon = sports[sportType].icon;
                  const label = sports[sportType].label;

                  return (
                    <span
                      key={sportType}
                      className="flex items-center gap-0.5 rounded-lg border border-[#65D1F8] bg-[#CAF2FF]/40 px-1 py-0.5 text-sm"
                    >
                      {icon && icon({ className: "h-5 w-5" })}
                      <span>{label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="my-3 border-t border-[#65D1F8]" />
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                onClick={handleFlipped}
                variant="outline"
                className="flex-1 rounded-lg border-[#65D1F8] px-6 py-2 text-base font-medium text-[#65D1F8] hover:bg-[#CAF2FF]/40 hover:text-[#65D1F8]"
                disabled={disabled}
              >
                See More
              </Button>
              <Button
                type="button"
                variant="default"
                className="flex-1 rounded-lg bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-6 py-2 text-base font-medium text-white hover:opacity-90"
                disabled={disabled}
              >
                Message
              </Button>
            </div>
          </div>
        </Card>

        <Card className="absolute inset-0 flex h-full rotate-y-180 flex-col rounded-2xl border-[#65D1F8] p-4 shadow-lg [backface-visibility:hidden]">
          <div className="flex items-center gap-3">
            <img
              src={matchedUser.avatar}
              alt={matchedUser.name}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div className="text-left">
              <h3 className="text-xl font-bold">{matchedUser.name}</h3>
              {minDistance !== Number.MAX_SAFE_INTEGER && (
                <p className="text-sm text-gray-500">
                  📍 {(minDistance / 1000).toFixed(1)} km away
                </p>
              )}
            </div>
          </div>
          <div className="my-3 border-t border-[#65D1F8]" />
          <div className="flex-grow overflow-y-auto pr-2">
            <div className="pb-3 text-left">
              <p className="text-base font-semibold text-gray-700">
                You both are interested in:
              </p>
              <div className="mt-1.5 flex flex-wrap gap-0.5">
                {commonSports.map((sportType) => {
                  const icon = sports[sportType].icon;
                  const label = sports[sportType].label;

                  return (
                    <span
                      key={sportType}
                      className="flex items-center gap-0.5 rounded-lg border border-[#65D1F8] bg-[#CAF2FF]/40 px-1 py-0.5 text-sm"
                    >
                      {icon && icon({ className: "h-5 w-5" })}
                      <span>{label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="pb-3 text-left">
              <p className="text-base font-semibold text-gray-700">
                Why I'm here...
              </p>
              <div className="mt-1.5 flex flex-wrap gap-0.5">
                {matchedUser.objectives.map(({ objectiveType }) => {
                  const icon = objectives[objectiveType].icon;
                  const label = objectives[objectiveType].label;

                  return (
                    <span
                      key={objectiveType}
                      className="flex items-center gap-0.5 rounded-lg border border-[#6CCFD0] bg-white px-1 py-0.5 text-sm"
                    >
                      {icon && icon({ className: "h-5 w-5" })}
                      <span>{label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="pb-3 text-left">
              <p className="text-base font-semibold text-gray-700">
                Preferred Play Times:
              </p>
              <p className="mt-1 text-sm text-gray-500">
                🕒 {matchedUser.availability}
              </p>
            </div>
            <div className="text-left">
              <p className="text-base font-semibold text-gray-700">
                Preferred Locations:
              </p>
              {matchedUser.locations.map(
                ({ locationDescription, locationId }) => (
                  <p key={locationId} className="mt-1 text-sm text-gray-500">
                    📍 {locationDescription}
                  </p>
                ),
              )}
            </div>
          </div>
          <div className="my-3 border-t border-[#65D1F8]" />
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              onClick={handleFlipped}
              variant="outline"
              className="flex-1 rounded-lg border-[#65D1F8] px-6 py-2 text-base font-medium text-[#65D1F8] hover:bg-[#CAF2FF]/40 hover:text-[#65D1F8]"
              disabled={disabled}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1 rounded-lg bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-6 py-2 text-base font-medium text-white hover:opacity-90"
              disabled={disabled}
            >
              Message
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const UserMatchingCardComponent = ({
  ...props
}: {
  matchedUser: typeof userProfile.infer;
  className?: string;
  flipped?: boolean;
  onFlipped?: (flipped: boolean) => void;
  disabled?: boolean;
}) => {
  const currentUserProfileQuery = useSuspenseQuery(
    getCurrentUserProfileQueryOptions(),
  );
  const currentUser = currentUserProfileQuery.data.profile;

  return currentUser ? (
    <InternalMatchingCardComponent user={currentUser} {...props} />
  ) : null;
};

const MatchingCardComponent = ({
  user,
  ...props
}: {
  user?: typeof userProfile.infer;
  matchedUser: typeof userProfile.infer;
  className?: string;
  flipped?: boolean;
  onFlipped?: (flipped: boolean) => void;
  disabled?: boolean;
}) => {
  return user ? (
    <InternalMatchingCardComponent user={user} {...props} />
  ) : (
    <UserMatchingCardComponent {...props} />
  );
};

export default MatchingCardComponent;
