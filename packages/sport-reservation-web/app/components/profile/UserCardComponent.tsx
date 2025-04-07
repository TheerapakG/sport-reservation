import { Card } from "@/components/ui/card";
import { sports } from "@/utils/lookup/sport";
import type { userProfile } from "sport-reservation-user/models";

export default function UserCardComponent({
  user,
  clubCount,
  scheduleCount,
}: {
  user: typeof userProfile.infer;
  clubCount: number;
  scheduleCount: number;
}) {
  return (
    <Card className="w-72 rounded-2xl border-2 border-[#65D1F8] p-4 text-center">
      <img
        src={user.avatar}
        alt={user.name}
        className="mx-auto h-32 w-32 rounded-lg object-cover" // Adjusted for rounded avatar
      />
      <h3 className="mt-4 text-2xl font-bold">{user.name}</h3>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {user.sports.map(({ sportType }) => {
          const sportInfo = sports[sportType];
          if (!sportInfo) return null; // Handle cases where sport might not be in the lookup

          const { icon: Icon, label } = sportInfo;

          return (
            <span
              key={sportType}
              className="flex items-center gap-1 rounded-lg border bg-gray-300 px-3 py-1 text-sm" // Adjusted styling
            >
              {Icon && <Icon className="h-4 w-4" />} <span>{label}</span>
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex justify-around border-t pt-4">
        <div className="flex flex-col items-center text-center">
          <p className="text-2xl font-bold">{clubCount}</p>
          <p className="text-sm text-gray-600">Clubs</p>
        </div>
        <div className="border-l"></div> {/* Vertical separator */}
        <div className="flex flex-col items-center text-center">
          <p className="text-2xl font-bold">{scheduleCount}</p>
          <p className="text-sm text-gray-600">Participations</p>
        </div>
      </div>
    </Card>
  );
}
