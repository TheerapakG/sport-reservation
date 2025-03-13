// src/pages/EventsPage.tsx
import React from "react";
import EventListing from "@/components/eventlisting";

export default function EventsPage() {
  const events = [
    {
      dateTime: "Fri, 31 Jan (1:00 - 2:00 PM)",
      title: "101 Friendly Match Badminton",
      description: "Short description about this activity over here.",
      location: "101 Badminton Club",
      participants: "8/10",
    },
    {
      dateTime: "Fri, 31 Jan (3:00 - 5:00 PM)",
      title: "Evening Football",
      description: "Short description about this activity over here.",
      location: "81 badminton court",
      participants: "20/20",
      buttonLabel: "Join Waitlist",
    },
    {
      dateTime: "Fri, 31 Jan (3:00 - 5:00 PM)",
      title: "Evening Football",
      description: "Short description about this activity over here.",
      location: "81 badminton court",
      participants: "20/20",
      buttonLabel: "Join Waitlist",
    },
    {
      dateTime: "Fri, 31 Jan (3:00 - 5:00 PM)",
      title: "Evening Football",
      description: "Short description about this activity over here.",
      location: "81 badminton court",
      participants: "20/20",
      buttonLabel: "Join Waitlist",
    },
    {
      dateTime: "Fri, 31 Jan (3:00 - 5:00 PM)",
      title: "Evening Football",
      description: "Short description about this activity over here.",
      location: "81 badminton court",
      participants: "20/20",
      buttonLabel: "Join Waitlist",
    },
  ];
  return (
    <div className="p-4">
      {/* Tabs: "Events" & "Clubs" */}
      <div className="mb-6 flex items-center space-x-8">
        {/* Active tab in red (#FF0000) */}
        <button className="border-b-2 border-[#FF0000] pb-1 font-bold text-[#FF0000]">
          Events
        </button>
        {/* Inactive tab */}
        <button className="text-gray-500 hover:text-gray-700">Clubs</button>
      </div>

      {/* ========== DATE SECTION: TODAY ========== */}
      <div className="mb-8">
        <h3 className="mb-1 text-lg font-semibold">Today</h3>
        <hr className="mb-4 w-full border-t-2 border-black" />

        <EventListing
          dateTime="Thu, 30 Jan (1:00 - 3:00 PM)"
          title="Hey! Badminton"
          description="Short description about this activity over here."
          location="81 badminton court"
          participants="5/10"
        />
      </div>

      {/* ========== DATE SECTION: THURSDAY, 13 FEB ========== */}
      <div className="mb-8">
        <h3 className="mb-1 text-lg font-semibold">Thursday, 13 Feb</h3>
        <hr className="mb-4 w-full border-t-2 border-black" />

        {events.map(
          ({ dateTime, title, description, location, participants }) => (
            <EventListing
              dateTime={dateTime}
              title={title}
              description={description}
              location={location}
              participants={participants}
            />
          ),
        )}
      </div>

      {/* ========== DATE SECTION: (ADD MORE DATES) ========== */}
      {/* ... Repeat for other dates ... */}
    </div>
  );
}
