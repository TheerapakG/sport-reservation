import { createFileRoute, Link } from "@tanstack/react-router";

function MatchingPage() {
  // Example user data for the "owner" of the account
  const user = {
    name: "Butter Bear",
    image: "app/components/Assets/Image/ProfileButterBear.png",
    distance: 2.3,
    sports: ["Badminton", "Tennis"],
    reasons: ["Stay active", "Just for fun", "Meet new friend", "Casual match"],
    playTimes: "Weekends & Evenings",
    locations: ["81 Badminton Court", "Tennis Sport Hub"],
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* Overlapping Cards Container */}
      <div className="relative w-72">
        {/* BACK CARD (slightly rotated + scaled) */}
        <div className="absolute top-0 left-0 z-0 w-full scale-95 -rotate-6">
          <div className="rounded-2xl border border-[#65D1F8] bg-white p-4 text-center shadow-lg">
            <h3 className="text-lg font-bold">{user.name}</h3>
            <p className="text-xs text-gray-500">📍 {user.distance} km away</p>
            <p className="mt-2 text-sm text-gray-600">
              You both are interested in:
            </p>
            <div className="mt-1 flex justify-center gap-2">
              {user.sports.map((sport) => (
                <span
                  key={sport}
                  className="rounded-lg border border-[#65D1F8] bg-[#CAF2FF]/40 px-2 py-1 text-xs"
                >
                  {sport === "Badminton" ? "🏸" : "🎾"} {sport}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">Why I'm here...</p>
            <div className="mt-1 flex flex-wrap justify-center gap-1">
              {user.reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-lg border border-[#6CCFD0] bg-white px-2 py-1 text-xs"
                >
                  {reason}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">Preferred Play Times:</p>
            <p className="text-xs text-gray-500">{user.playTimes}</p>
            <p className="mt-2 text-sm text-gray-600">Preferred Locations:</p>
            <p className="text-xs text-gray-500">{user.locations.join(", ")}</p>
          </div>
        </div>

        {/* FRONT CARD (on top) */}
        <div className="relative z-10 rounded-2xl border border-[#65D1F8] bg-white p-4 text-center shadow-lg">
          <img
            src={user.image}
            alt={user.name}
            className="h-48 w-full rounded-lg object-cover"
          />
          <h3 className="mt-2 text-lg font-bold">{user.name}</h3>
          <p className="text-sm text-gray-600">Sport Interest</p>
          <div className="mt-1 flex justify-center gap-2">
            {user.sports.map((sport) => (
              <span
                key={sport}
                className="flex items-center gap-1 rounded-lg border border-[#65D1F8] bg-[#CAF2FF]/40 px-2 py-1 text-xs"
              >
                {sport === "Badminton" ? "🏸" : "🎾"} {sport}
              </span>
            ))}
          </div>
          <div className="mt-3 flex justify-between">
            <button className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90">
              See More
            </button>
            <button className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90">
              Message
            </button>
          </div>
        </div>
      </div>

      {/* Text Section Below the Card */}
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

      {/* "Match now!" Button linking to usercard.tsx */}
      <Link
        to="/usercard"
        className="mt-6 inline-block rounded bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-600"
      >
        Match now!
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/_layout/matching")({
  component: MatchingPage,
});
