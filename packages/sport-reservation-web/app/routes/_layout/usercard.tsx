// import { createFileRoute } from "@tanstack/react-router";
// import { useState } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";

// interface User {
//   name: string;
//   image: string;
//   distance: number;
//   sports: string[];
//   reasons: string[];
//   playTimes: string;
//   locations: string[];
// }

// const UserCard: React.FC<{ user: User }> = ({ user }) => {
//   const [flipped, setFlipped] = useState(false);

//   return (
//     <motion.div
//       className="h-auto w-72"
//       initial={{ rotateY: 0 }}
//       animate={{ rotateY: flipped ? 180 : 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       {!flipped ? (
//         <Card className="rounded-2xl border p-4 text-center shadow-lg">
//           <img
//             src={user.image}
//             alt={user.name}
//             className="h-48 w-full rounded-lg object-cover"
//           />
//           <h3 className="mt-2 text-lg font-bold">{user.name}</h3>
//           <p className="text-sm text-gray-600">Common Sports:</p>
//           <div className="mt-1 flex justify-center gap-2">
//             {user.sports.map((sport: string) => (
//               <span
//                 key={sport}
//                 className="flex items-center gap-1 rounded-lg border border-blue-400 bg-blue-200 px-2 py-1 text-xs"
//               >
//                 {sport === "Badminton" ? "🏸" : "🎾"} {sport}
//               </span>
//             ))}
//           </div>
//           <div className="mt-3 flex justify-between">
//             <Button onClick={() => setFlipped(true)} variant="outline">
//               See More
//             </Button>
//             <Button variant="default">Message</Button>
//           </div>
//         </Card>
//       ) : (
//         <Card className="rounded-2xl border p-4 text-center shadow-lg">
//           <h3 className="text-lg font-bold">{user.name}</h3>
//           <p className="text-xs text-gray-500">📍 {user.distance} km away</p>
//           <p className="mt-2 text-sm text-gray-600">
//             You both are interested in:
//           </p>
//           <div className="mt-1 flex justify-center gap-2">
//             {user.sports.map((sport: string) => (
//               <span
//                 key={sport}
//                 className="rounded-lg border border-blue-400 bg-blue-200 px-2 py-1 text-xs"
//               >
//                 {sport === "Badminton" ? "🏸" : "🎾"} {sport}
//               </span>
//             ))}
//           </div>
//           <p className="mt-2 text-sm text-gray-600">Why I'm here...</p>
//           <div className="mt-1 flex flex-wrap justify-center gap-1">
//             {user.reasons.map((reason: string) => (
//               <span
//                 key={reason}
//                 className="rounded-lg border border-gray-400 bg-gray-200 px-2 py-1 text-xs"
//               >
//                 {reason}
//               </span>
//             ))}
//           </div>
//           <p className="mt-2 text-sm text-gray-600">Preferred Play Times:</p>
//           <p className="text-xs text-gray-500">{user.playTimes}</p>
//           <p className="mt-2 text-sm text-gray-600">Preferred Locations:</p>
//           <p className="text-xs text-gray-500">{user.locations.join(", ")}</p>
//           <div className="mt-3 flex justify-between">
//             <Button onClick={() => setFlipped(false)} variant="outline">
//               Back
//             </Button>
//             <Button variant="default">Message</Button>
//           </div>
//         </Card>
//       )}
//     </motion.div>
//   );
// };

// const userCardList = ({ users }: { users: User[] }) => {
//   return (
//     <div className="container mx-auto flex min-h-screen flex-wrap items-center justify-center gap-4">
//       {users.map((user, index) => (
//         <UserCard key={index} user={user} />
//       ))}
//     </div>
//   );
// };

// export const Route = createFileRoute("/_layout/usercard")({
//   component: () =>
//     userCardList({
//       users: [
//         {
//           name: "Beth Elizabeth",
//           image: "app/components/Assets/Image/ProfileBeth.jpeg",
//           distance: 2.3,
//           sports: ["Badminton"],
//           reasons: ["Just for fun"],
//           playTimes: "Evening",
//           locations: ["Anywhere"],
//         },
//         {
//           name: "Sarah Lee",
//           image: "app/components/Assets/Image/ProfileSarahLee.png",
//           distance: 2.3,
//           sports: ["Badminton"],
//           reasons: ["Just for fun"],
//           playTimes: "Evening",
//           locations: ["Anywhere"],
//         },
//         {
//           name: "Victoria K.",
//           image: "app/components/Assets/Image/ProfileVictoriaK.png",
//           distance: 2.3,
//           sports: ["Badminton"],
//           reasons: ["Just for fun"],
//           playTimes: "Evening",
//           locations: ["Anywhere"],
//         },
//         {
//           name: "Lisa M.",
//           image: "app/components/Assets/Image/ProfileLisa.png",
//           distance: 2.3,
//           sports: ["Badminton"],
//           reasons: ["Just for fun"],
//           playTimes: "Evening",
//           locations: ["Anywhere"],
//         },
//       ],
//     }),
// });
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface User {
  name: string;
  image: string;
  distance: number;
  sports: string[];
  reasons: string[];
  playTimes: string;
  locations: string[];
}

// CHANGED: We no longer use the conditional (!flipped ? (...) : (...)) for front/back.
// Instead, we render both sides at once and flip the container.
const UserCard: React.FC<{ user: User }> = ({ user }) => {
  const [flipped, setFlipped] = useState(false);

  // CHANGED: Wrap everything in a parent <div> with perspective
  return (
    <div className="relative w-72 [perspective:1000px]">
      {" "}
      {/* CHANGED */}
      <motion.div
        className="relative h-auto w-full [transform-style:preserve-3d]" // CHANGED
        initial={{ rotateY: 0 }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ---------- FRONT SIDE ---------- */}
        {/* CHANGED: Keep front side in DOM at all times, absolutely positioned */}
        <Card
          className="/* CHANGED */ absolute w-full rounded-2xl border-[#65D1F8] p-4 text-center shadow-lg [backface-visibility:hidden]"
          style={{ transform: "rotateY(0deg)" }} // CHANGED
        >
          <img
            src={user.image}
            alt={user.name}
            className="h-48 w-full rounded-lg object-cover"
          />
          <h3 className="mt-2 text-lg font-bold">{user.name}</h3>
          <p className="text-sm text-gray-600">Common Sports:</p>
          <div className="mt-1 flex justify-center gap-2">
            {user.sports.map((sport: string) => (
              <span
                key={sport}
                className="flex items-center gap-1 rounded-lg border border-[#65D1F8] bg-[#CAF2FF]/40 px-2 py-1 text-xs"
              >
                {sport === "Badminton" ? "🏸" : "🎾"} {sport}
              </span>
            ))}
          </div>
          <div className="mt-3 flex justify-between">
            <Button
              onClick={() => setFlipped(true)}
              variant="outline"
              className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]"
            >
              See More
            </Button>
            <Button
              variant="default"
              className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]"
            >
              Message
            </Button>
          </div>
        </Card>

        {/* ---------- BACK SIDE ---------- */}
        {/* CHANGED: Keep back side in DOM, rotate 180, also hidden by backface */}
        <Card className="/* CHANGED */ absolute w-full [transform:rotateY(180deg)] rounded-2xl border-[#65D1F8] p-4 text-center shadow-lg [backface-visibility:hidden]">
          <h3 className="text-lg font-bold">{user.name}</h3>
          <p className="text-xs text-gray-500">📍 {user.distance} km away</p>
          <p className="mt-2 text-sm text-gray-600">
            You both are interested in:
          </p>
          <div className="mt-1 flex justify-center gap-2">
            {user.sports.map((sport: string) => (
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
            {user.reasons.map((reason: string) => (
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
          <div className="mt-3 flex justify-between">
            <Button
              onClick={() => setFlipped(false)}
              variant="outline"
              className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]" // CHANGED: Custom button styles
            >
              Back
            </Button>
            <Button
              variant="default"
              className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]" // CHANGED: Custom button styles
            >
              Message
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const userCardList = ({ users }: { users: User[] }) => {
  return (
    <div className="container mx-auto flex min-h-screen flex-wrap items-center justify-center gap-4">
      {users.map((user, index) => (
        <UserCard key={index} user={user} />
      ))}
    </div>
  );
};

export const Route = createFileRoute("/_layout/usercard")({
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
