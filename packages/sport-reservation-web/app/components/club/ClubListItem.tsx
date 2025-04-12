// src/components/EventListing.tsx
import { Link } from "@tanstack/react-router"; // Import Link from TanStack Router
import { MapPin, UsersIcon } from "lucide-react"; // or your icon library
import { clubType } from "sport-reservation-club/models";
import ClubJoinModal from "./ClubJoinModal";

export default function ClubListItem({
  club,
}: {
  club: typeof clubType.infer;
}) {
  return (
    <div className="flex space-x-4 rounded-md bg-white p-4 shadow">
      <Link
        to={`/club/$clubId`}
        params={{
          clubId: club.id,
        }}
      >
        <img
          src={
            club.image ??
            "https://cdn.theerapakg.moe/reservation/asset/event/badminton-default.jpg"
          }
          alt={club.name}
          className="h-32 w-48 rounded-md object-cover"
        />
      </Link>

      <div className="flex w-full flex-col justify-between">
        <Link
          to={`/club/$clubId`}
          params={{
            clubId: club.id,
          }}
          className="flex w-full flex-col justify-between"
        >
          <p className="text-xl font-semibold">{club.name}</p>
          <p className="text-sm text-gray-600">{club.description}</p>
          <p className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-1" />
            {club.locationDescription}
          </p>
        </Link>
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <ClubJoinModal club={club}>
            <button type="button" className="flex py-2 pr-4">
              <div className="flex h-auto items-center gap-x-2 rounded-l rounded-r-none border-1 border-[#65D1F8] bg-[#E1F8FE] px-3 py-1 align-middle text-sm text-[#65D1F8] hover:bg-[#E1F8FE] hover:text-[#65D1F8] dark:bg-[#E1F8FE]">
                <UsersIcon className="h-4 w-4" />
                {club.size}
              </div>
              <div className="flex h-auto items-center gap-x-2 rounded-l-none rounded-r border-1 border-[#65D1F8] bg-[#65D1F8] px-3 py-1 align-middle text-sm text-[#E1F8FE] hover:bg-[#65D1F8] hover:text-[#E1F8FE] dark:bg-[#65D1F8]">
                Join
              </div>
            </button>
          </ClubJoinModal>
        </div>
      </div>
    </div>
  );
}
