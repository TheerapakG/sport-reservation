import MatchingCardComponent from "@/components/matching/MatchingCardComponent";
import { createFileRoute } from "@tanstack/react-router";
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
      { objectiveId: "1", objectiveType: "train_improve" },
      { objectiveId: "2", objectiveType: "just_for_fun" },
      { objectiveId: "3", objectiveType: "meet_new_friends" },
      { objectiveId: "4", objectiveType: "casual_matches" },
    ],
    availability: "Weekends & Evenings",
    locations: [
      {
        locationId: "1",
        location: [37.774929, -122.419418],
        locationDescription: "81 Badminton Court",
      },
      {
        locationId: "2",
        location: [37.774929, -122.419418],
        locationDescription: "Tennis Sport Hub",
      },
    ],
  }) satisfies typeof userProfile.infer;

export const Route = createFileRoute("/_layout/debug")({
  component: RouteComponent,
});

function RouteComponent() {
  const exampleUser = useExampleUser();
  return (
    <div className="flex gap-4 p-8">
      <MatchingCardComponent user={exampleUser} matchedUser={exampleUser} />
      <MatchingCardComponent user={exampleUser} matchedUser={exampleUser} />
    </div>
  );
}
