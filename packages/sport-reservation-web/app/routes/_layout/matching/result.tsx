import UserCardComponent from "@/components/matching/UserCardComponent";
import { createFileRoute } from "@tanstack/react-router";

type User = {
  name: string;
  image: string;
  distance: number;
  sports: string[];
  reasons: string[];
  playTimes: string;
  locations: string[];
};

const userCardList = ({ users }: { users: User[] }) => {
  return (
    <div className="container mx-auto flex min-h-screen flex-wrap items-center justify-center gap-4">
      {users.map((user, index) => (
        <UserCardComponent key={index} user={user} />
      ))}
    </div>
  );
};

export const Route = createFileRoute("/_layout/matching/result")({
  component: () =>
    userCardList({
      users: [
        {
          name: "Beth Elizabeth",
          image: "app/components/Assets/Image/ProfileBeth.jpeg",
          distance: 2.3,
          sports: ["Badminton", "Tennis"],
          reasons: [
            "Stay active",
            "Just for fun",
            "Meet new friend",
            "Casual match",
          ],
          playTimes: "Weekends & Evenings",
          locations: ["81 Badminton Court", "Tennis Sport Hub"],
        },
        {
          name: "Sarah Lee",
          image: "app/components/Assets/Image/ProfileSarahLee.png",
          distance: 4.6,
          sports: ["Badminton"],
          reasons: [
            "Stay active",
            "Play to win",
            "Love a challenge",
            "Serious play",
          ],
          playTimes: "Evening",
          locations: ["81 Badminton Court", "CU Sports Complex"],
        },
        {
          name: "Victoria K.",
          image: "app/components/Assets/Image/ProfileVictoriaK.png",
          distance: 1.8,
          sports: ["Badminton"],
          reasons: [
            "Stay active",
            "Relax & Rally",
            "Let's push limit",
            "Casual match",
          ],
          playTimes: "Wednesday & Sunday",
          locations: ["Flexible Location"],
        },
        {
          name: "Lisa M.",
          image: "app/components/Assets/Image/ProfileLisa.png",
          distance: 2.3,
          sports: ["Badminton", "Tennis"],
          reasons: [
            "Stay active",
            "Just for fun",
            "Meet new friends",
            "casual match",
          ],
          playTimes: "Weekends & Evenings",
          locations: ["Flexible Location"],
        },
      ],
    }),
});
