import { Link } from "@tanstack/react-router";

const mockEvents = [
  {
    id: "hey-badminton",
    title: "Hey! Badminton",
    host: "Marcus Rashford",
    dateTime: "Fri, 14 Mar (3:00 - 5:00 PM)",
    location: "81 Badminton Court, Bang Khae District, Bangkok, Thailand",
    description:
      "Looking for a fun and energetic badminton session? Join players of all skill levels for an exciting match!",
    participants: [
      { name: "Marcus", avatar: "https://via.placeholder.com/40" },
      { name: "Harry", avatar: "https://via.placeholder.com/40" },
      { name: "Mohamed", avatar: "https://via.placeholder.com/40" },
      { name: "Klopp", avatar: "https://via.placeholder.com/40" },
    ],
    totalSlots: 8,
    image: "https://via.placeholder.com/600x300",
  },
  {
    id: "friendly-football",
    title: "Friendly Football",
    host: "Harry Kane",
    dateTime: "Sat, 15 Mar (2:00 - 4:00 PM)",
    location: "Local Stadium",
    description:
      "A casual football match with friends. All skill levels are welcome to join in the fun!",
    participants: [
      { name: "Harry", avatar: "https://via.placeholder.com/40" },
      { name: "Tom", avatar: "https://via.placeholder.com/40" },
    ],
    totalSlots: 10,
    image: "https://via.placeholder.com/600x300",
  },
];

function EventDetailPage({ eventId }: { eventId: string }) {
  const event = mockEvents.find((e) => e.id === eventId);

  if (!event) {
    return <div className="p-4">Event not found!</div>;
  }

  const {
    title,
    host,
    dateTime,
    location,
    description,
    participants,
    totalSlots,
    image,
  } = event;
  const numParticipants = participants.length;

  function handleJoin() {
    alert("Join flow triggered!");
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      {/* The back link here uses a relative path, resolving to /_layout/events */}
      <Link to=".." className="mb-4 inline-block text-blue-500 underline">
        &larr; Back to Events
      </Link>

      <div className="mb-4 rounded bg-white p-4 shadow">
        <h1 className="mb-1 text-2xl font-bold">{title}</h1>
        <p className="mb-3 text-sm text-gray-500">Hosted by {host}</p>
        <img
          src={image}
          alt={title}
          className="mb-4 h-60 w-full rounded object-cover"
        />
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">When</h2>
            <p className="text-sm text-gray-600">{dateTime}</p>
          </div>
          <div className="mt-4 space-y-1 md:mt-0">
            <h2 className="text-lg font-semibold">Where</h2>
            <p className="text-sm text-gray-600">{location}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-bold">About</h2>
        <p className="mb-4 text-sm text-gray-700">{description}</p>
        <h2 className="mb-2 text-lg font-bold">
          Participants ({numParticipants}/{totalSlots})
        </h2>
        <div className="flex items-center space-x-2">
          {participants.slice(0, 4).map((p, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={p.avatar || "https://via.placeholder.com/40"}
                alt={p.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="mt-1 text-xs">{p.name}</span>
            </div>
          ))}
          {numParticipants > 4 && (
            <p className="text-sm text-gray-600">
              + {numParticipants - 4} more
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded bg-white p-4 shadow">
        <p className="text-sm text-gray-600">
          {numParticipants}/{totalSlots} joined
        </p>
        <button
          onClick={handleJoin}
          className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
        >
          Join
        </button>
      </div>
    </div>
  );
}

export default EventDetailPage;
