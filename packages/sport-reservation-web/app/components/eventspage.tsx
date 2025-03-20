import React from "react";
import EventListing from "@/components/eventlisting";
import dayjs from "dayjs";
import { mockEventsByDate } from "@/components/mockEvents";

type EventsPageProps = {
  selectedDate?: string; // "YYYY-MM-DD"
};

export default function EventsPage({ selectedDate }: EventsPageProps) {
  // If no date is selected, default to "today"
  const todayString = dayjs().format("YYYY-MM-DD");
  const dateToShow = selectedDate || todayString;

  // Get the array of events for that date (or empty)
  const events = mockEventsByDate[dateToShow] || [];

  // If date is "todayString", show "Today" heading, else show date
  const heading =
    dateToShow === todayString
      ? "Today"
      : dayjs(dateToShow).format("dddd, DD MMM");

  return (
    <div className="p-4">
      {/* Tabs: "Events" & "Clubs" */}
      <div className="mb-6 flex items-center space-x-8">
        {/* Active tab in red */}
        <button className="border-b-2 border-[#F28382] pb-1 font-bold text-[#F28382]">
          Events
        </button>
        {/* Inactive tab */}
        <button className="text-gray-500 hover:text-gray-700">Clubs</button>
      </div>

      <div className="mb-8">
        <h3 className="mb-1 text-lg font-semibold">{heading}</h3>
        <hr className="mb-4 w-full border-t-2 border-black" />

        {events.length === 0 ? (
          <p className="text-gray-500">No events for this date.</p>
        ) : (
          events.map((evt) => (
            <EventListing
              key={evt.id}
              // If you have real images, pass them in:
              // image="/someLocalImage.jpg"
              dateTime={evt.dateTime}
              title={evt.title}
              description={evt.description}
              location={evt.location}
              participants={evt.participants}
            />
          ))
        )}
      </div>
    </div>
  );
}
