// src/routes/events.tsx
import Calendar from "@/components/calendar";
import CreateEventForm from "@/components/create-events";
import EventListing from "@/components/eventlisting";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";

// Mock events keyed by date for March 19 - 24, 2025
const mockEventsByDate: Record<
  string,
  {
    id: string;
    dateTime: string;
    title: string;
    description: string;
    location: string;
    participants: string;
  }[]
> = {
  "2025-03-19": [
    {
      id: "event-19-1",
      dateTime: "Sun, 19 Mar (10:00 - 11:30 AM)",
      title: "Morning Yoga",
      description: "Start your day with a calm yoga session.",
      location: "Yoga Studio",
      participants: "5/10",
    },
    {
      id: "event-19-2",
      dateTime: "Sun, 19 Mar (2:00 - 3:00 PM)",
      title: "Evening Run",
      description: "Join a group run in the park.",
      location: "Central Park",
      participants: "8/15",
    },
  ],
  "2025-03-20": [
    {
      id: "event-20-1",
      dateTime: "Mon, 20 Mar (5:00 - 7:00 PM)",
      title: "Badminton Match",
      description: "Friendly badminton match.",
      location: "Sports Club",
      participants: "4/8",
    },
    {
      id: "event-20-2",
      dateTime: "Mon, 20 Mar (8:00 - 9:00 PM)",
      title: "Tennis Practice",
      description: "Practice your tennis serve.",
      location: "Tennis Court",
      participants: "3/6",
    },
  ],
  "2025-03-21": [
    {
      id: "event-21-1",
      dateTime: "Tue, 21 Mar (6:00 - 7:00 AM)",
      title: "Morning Run",
      description: "A brisk morning run.",
      location: "City Park",
      participants: "6/12",
    },
    {
      id: "event-21-2",
      dateTime: "Tue, 21 Mar (7:30 - 9:00 PM)",
      title: "Evening Yoga",
      description: "Relaxing yoga session to wind down.",
      location: "Yoga Center",
      participants: "7/10",
    },
    {
      id: "event-21-3",
      dateTime: "Tue, 21 Mar (4:00 - 5:30 PM)",
      title: "Badminton Doubles",
      description: "Join a doubles game.",
      location: "Indoor Court",
      participants: "4/8",
    },
  ],
  "2025-03-22": [
    {
      id: "event-22-1",
      dateTime: "Wed, 22 Mar (12:00 - 1:00 PM)",
      title: "Friendly Football",
      description: "Casual football with friends.",
      location: "Local Field",
      participants: "5/11",
    },
    {
      id: "event-22-2",
      dateTime: "Wed, 22 Mar (5:00 - 6:30 PM)",
      title: "Tennis Singles",
      description: "Practice your tennis skills.",
      location: "Tennis Club",
      participants: "3/6",
    },
  ],
  "2025-03-23": [
    {
      id: "event-23-1",
      dateTime: "Thu, 23 Mar (6:00 - 7:00 AM)",
      title: "Morning Run",
      description: "Join a group run to boost your energy.",
      location: "Riverside Park",
      participants: "6/12",
    },
    {
      id: "event-23-2",
      dateTime: "Thu, 23 Mar (8:00 - 9:30 AM)",
      title: "Badminton Clinic",
      description: "Improve your skills with a coach.",
      location: "Sports Center",
      participants: "5/10",
    },
  ],
  "2025-03-24": [
    {
      id: "event-24-1",
      dateTime: "Fri, 24 Mar (7:00 - 8:00 AM)",
      title: "Tennis Practice",
      description: "Practice forehand and backhand drills.",
      location: "Tennis Academy",
      participants: "4/8",
    },
    {
      id: "event-24-2",
      dateTime: "Fri, 24 Mar (6:00 - 7:00 PM)",
      title: "Evening Run",
      description: "A relaxed run to finish the day.",
      location: "City Track",
      participants: "7/14",
    },
  ],
};

export const Route = createFileRoute("/_layout/events/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date("2025-03-19"),
  );

  const selectedDateStr = dayjs(selectedDate).format("YYYY-MM-DD");

  // Get events for the displayedDate from the mock data
  const filteredEvents = mockEventsByDate[selectedDateStr] || [];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN (Sidebar) */}
        <aside className="w-96 space-y-8 overflow-auto bg-gray-50 p-4">
          {/* Calendar Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#F28382]">Calendar</CardTitle>
              <CardDescription>Select a date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="flex justify-center rounded-xl border-2 border-[#65D1F8] p-2"
              />
            </CardContent>
          </Card>

          {/* Create Events Card */}
          <Card className="overflow-hidden rounded-2xl bg-white p-2">
            <CardHeader className="p-2">
              {/* The CreateEventForm includes its own heading */}
            </CardHeader>
            <CardContent className="p-2">
              <CreateEventForm />
            </CardContent>
          </Card>
        </aside>

        {/* RIGHT COLUMN (Event Listing) */}
        <main className="flex-1 overflow-auto bg-white p-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt) => (
              <EventListing
                key={evt.id}
                eventId={evt.id}
                title={evt.title}
                dateTime={evt.dateTime}
                description={evt.description}
                location={evt.location}
                participants={evt.participants}
              />
            ))
          ) : (
            <div className="text-center text-gray-500">
              No events found for {selectedDateStr}.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
