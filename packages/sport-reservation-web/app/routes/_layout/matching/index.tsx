import UserCardComponent from "@/components/matching/UserCardComponent";
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
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className="relative w-72">
        <UserCardComponent
          user={user}
          className="absolute top-0 left-0 z-0 -translate-x-3 -rotate-6"
          disabled={true}
        />
        <UserCardComponent user={user} className="z-10" disabled={true} />
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

      <Link
        to="/matching/result"
        className="mt-6 inline-block rounded bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-600"
      >
        Match now!
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/_layout/matching/")({
  component: MatchingPage,
});
