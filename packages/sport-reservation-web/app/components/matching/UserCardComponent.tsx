import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

type User = {
  name?: string;
  avatar?: string;
  distance?: number;
  sports: string[];
  objectives: string[];
  availability?: string;
  locations: string[];
};

export default function UserCard({
  user,
  className,
  disabled,
}: {
  user: User;
  className?: string;
  disabled?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={cn("relative w-72 [perspective:1000px]", className)}>
      <motion.div
        className="[transform-style:preserve-3d]"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full rotate-y-0 rounded-2xl border-[#65D1F8] p-4 text-center shadow-lg [backface-visibility:hidden]">
          <img
            src={user.avatar}
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
              disabled={disabled}
            >
              Message
            </Button>
          </div>
        </Card>

        <Card className="absolute inset-0 rotate-y-180 rounded-2xl border-[#65D1F8] p-4 text-center shadow-lg [backface-visibility:hidden]">
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
            {user.objectives.map((objective: string) => (
              <span
                key={objective}
                className="rounded-lg border border-[#6CCFD0] bg-white px-2 py-1 text-xs"
              >
                {objective}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">Preferred Play Times:</p>
          <p className="text-xs text-gray-500">{user.availability}</p>
          <p className="mt-2 text-sm text-gray-600">Preferred Locations:</p>
          <p className="text-xs text-gray-500">{user.locations.join(", ")}</p>
          <div className="mt-3 flex justify-between">
            <Button
              onClick={() => setFlipped(false)}
              variant="outline"
              className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]"
            >
              Back
            </Button>
            <Button
              variant="default"
              className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:bg-[#AED6F1]"
              disabled={disabled}
            >
              Message
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
