// src/components/EventListing.tsx
import { MapPin, Users } from "lucide-react"; // or your icon library

type EventListingProps = {
  image?: string;
  dateTime: string;
  title: string;
  description: string;
  location: string;
  participants: string;
  buttonLabel?: string;
};

export default function EventListing({
  dateTime,
  title,
  description,
  location,
  participants,
  buttonLabel = "Join",
}: EventListingProps) {
  return (
    <div className="mb-4 flex max-w-3xl space-x-4 rounded-md bg-white p-4 shadow">
      {/* Event image */}
      <img
        src="https://cdn.theerapakg.moe/reservation/asset/events/badminton-default.jpg"
        alt={title}
        className="h-32 w-40 rounded-md object-cover"
      />

      {/* Right side: event details */}
      <div className="flex w-full flex-col justify-between">
        <div>
          {/* Date/time in red code color */}
          <p className="pb-1 text-sm text-red-500">{dateTime}</p>
          <h3 className="pb-1 text-base font-semibold">{title}</h3>
          <p className="pb-2 text-sm text-gray-600">{description}</p>
          <p className="flex items-center pb-2 text-sm text-gray-600">
            <MapPin size={16} className="pr-1" />
            {location}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="pr-1" />
            {participants}
          </div>
          <button className="rounded-md bg-[#65D1F8] px-4 py-1 text-sm text-white hover:bg-[#4A90E2]">
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
