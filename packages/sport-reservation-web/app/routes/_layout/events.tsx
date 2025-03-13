import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Calendar2 from "@/components/calendar-real";
import EventsPage from "@/components/eventspage";

export const Route = createFileRoute("/_layout/events")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen flex-col">
      <div className="relative w-full">
        {/* RIGHT COLUMN (scrollable event listings) */}
        <main
          className="absolute top-0 right-0 bottom-0 overflow-y-auto bg-white p-4"
          style={{ left: "300px" }}
        >
          <EventsPage />
        </main>

        {/* LEFT COLUMN (sidebar with the new Calendar and Create Event form) */}
        <aside
          className="inline-block space-y-4 border-r bg-gray-50 p-4 align-top"
          style={{ width: "300px" }}
        >
          {/* The new custom Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar2 />
            </CardContent>
          </Card>

          {/* Create Events Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Events</CardTitle>
              <CardDescription>Add a new activity</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    type="text"
                    placeholder="e.g. Friendly Football"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Short description..."
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="timeRange">Start / End</Label>
                    <Input
                      id="timeRange"
                      type="text"
                      placeholder="e.g. 20:00-21:00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g. Google Map link or place"
                  />
                </div>
                <div>
                  <Label htmlFor="maxParticipants">Max Participant</Label>
                  <Input id="maxParticipants" type="number" />
                </div>
                <div>
                  <Label htmlFor="addGuest">Add Guest</Label>
                  <Input
                    id="addGuest"
                    type="text"
                    placeholder="Optional guest list"
                  />
                </div>
                {/* Blue button with hover color */}
                <Button
                  type="submit"
                  className="bg-[#65D1F8] text-white hover:bg-[#4A90E2]"
                >
                  Create Event!
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
