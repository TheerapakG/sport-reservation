// src/components/CreateEventForm.tsx
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateEventForm() {
  // Main form states
  const [sport, setSport] = useState<string>("");
  const [performance, setPerformance] = useState<string>("");
  const [club, setClub] = useState<string>("");
  const [repeatOption, setRepeatOption] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Basic states for other form fields
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>();
  const [addGuest, setAddGuest] = useState<number | undefined>();
  const [joinOption, setJoinOption] = useState<"request" | "auto">("request");

  // Popup visibility states
  const [showAboutPopup, setShowAboutPopup] = useState(false);
  const [showClubPopup, setShowClubPopup] = useState(false);
  const [showRepeatPopup, setShowRepeatPopup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      eventName,
      description,
      date,
      timeRange,
      location,
      maxParticipants,
      addGuest,
      joinOption,
      sport,
      performance,
      club,
      repeatOption,
      endDate,
    };
    console.log("Form submitted with data:", formData);
    // Submit formData to API or process further
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      {/* Inner Card with round blue border and no shadow */}
      <div className="rounded-xl border-2 border-[#65D1F8] bg-white p-4">
        {/* Title in #F28382 */}
        <h2 className="mb-2 text-2xl font-bold" style={{ color: "#F28382" }}>
          Create Events
        </h2>
        <p className="mb-4 text-sm text-gray-500">Add a new activity</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 1) Picture Upload */}
          <div>
            <Label htmlFor="eventPicture">Event Picture</Label>
            <Input id="eventPicture" type="file" />
          </div>

          {/* 2) Event Name */}
          <div>
            <Label htmlFor="eventName">Event Name</Label>
            <Input
              id="eventName"
              type="text"
              placeholder="e.g. Friendly Football"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="border border-[#65D1F8]"
            />
          </div>

          {/* 3) Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Short description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-[#65D1F8]"
            />
          </div>

          {/* 4) Date & Time Range */}
          <div className="flex space-x-2">
            <div className="w-1/2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-[#65D1F8]"
              />
            </div>
            <div className="w-1/2">
              <Label htmlFor="timeRange">Start / End</Label>
              <Input
                id="timeRange"
                type="text"
                placeholder="e.g. 20:00-21:00"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-[#65D1F8]"
              />
            </div>
          </div>

          {/* 5) Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g. Google Map link or place"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-[#65D1F8]"
            />
          </div>

          {/* 6) Max Participant */}
          <div>
            <Label htmlFor="maxParticipants">Max Participant</Label>
            <Input
              id="maxParticipants"
              type="number"
              value={maxParticipants ?? ""}
              onChange={(e) =>
                setMaxParticipants(parseInt(e.target.value) || 0)
              }
              className="border border-[#65D1F8]"
            />
          </div>

          {/* 7) Add Guest */}
          <div>
            <Label htmlFor="addGuest">Add Guest</Label>
            <Input
              id="addGuest"
              type="number"
              placeholder="Number of additional guests"
              value={addGuest ?? ""}
              onChange={(e) => setAddGuest(parseInt(e.target.value) || 0)}
              className="border border-[#65D1F8]"
            />
          </div>

          {/* 8) + About your event => popup */}
          <div>
            <button
              type="button"
              className="text-[#65D1F8] underline"
              onClick={() => setShowAboutPopup(true)}
            >
              + About your event
            </button>
          </div>

          {/* 9) + Add this event to the club => popup */}
          <div>
            <button
              type="button"
              className="text-[#65D1F8] underline"
              onClick={() => setShowClubPopup(true)}
            >
              + Add this event to the club
            </button>
          </div>

          {/* 10) + Repeat Event => popup */}
          <div>
            <button
              type="button"
              className="text-[#65D1F8] underline"
              onClick={() => setShowRepeatPopup(true)}
            >
              + Repeat Event
            </button>
          </div>

          {/* 11) Joining Options */}
          <div>
            <p className="mb-1 text-sm font-semibold">Joining Options</p>
            <label className="mr-4">
              <input
                type="radio"
                name="joinOption"
                value="request"
                checked={joinOption === "request"}
                onChange={() => setJoinOption("request")}
              />
              <span className="ml-1 text-sm">Request to Join</span>
            </label>
            <label>
              <input
                type="radio"
                name="joinOption"
                value="auto"
                checked={joinOption === "auto"}
                onChange={() => setJoinOption("auto")}
              />
              <span className="ml-1 text-sm">Auto Join</span>
            </label>
          </div>

          {/* 12) Submit Button (centered) */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:opacity-90"
            >
              Create Event!
            </Button>
          </div>
        </form>
      </div>

      {/* --- POPUPS --- */}

      {/* About Popup */}
      {showAboutPopup && (
        <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
          <div className="w-80 rounded-xl bg-white p-4">
            <h3 className="mb-2 text-lg font-bold text-[#65D1F8]">
              About Your Event
            </h3>
            <p className="mb-2 text-sm font-semibold">Select a sport:</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {["Badminton", "Yoga", "Running", "Tennis", "Football"].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={`rounded-full border px-3 py-1 ${
                      sport === s
                        ? "border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8]"
                        : "border-gray-300 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
            <p className="mb-2 text-sm font-semibold">Performance Level:</p>
            <div className="flex flex-wrap gap-2">
              {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setPerformance(lvl)}
                  className={`rounded-full border px-3 py-1 ${
                    performance === lvl
                      ? "border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8]"
                      : "border-gray-300 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                onClick={() => setShowAboutPopup(false)}
                className="bg-[#65D1F8] px-4 py-1 text-white hover:opacity-90"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Club Popup */}
      {showClubPopup && (
        <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
          <div className="w-80 rounded-xl bg-white p-4">
            <h3 className="mb-2 text-lg font-bold text-[#65D1F8]">
              Select a club
            </h3>
            <div className="space-y-2">
              {[
                "Chula Football Club",
                "101 Badminton Club",
                "Yo! Badminton Club",
                "Sunday Tennis Club",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => setClub(c)}
                  className={`block w-full rounded-xl p-2 text-left ${
                    club === c
                      ? "border border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                onClick={() => setShowClubPopup(false)}
                className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:opacity-90"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Repeat Popup */}
      {showRepeatPopup && (
        <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
          <div className="w-72 rounded-xl bg-white p-4">
            <h3 className="mb-2 text-lg font-bold text-[#65D1F8]">
              Repeat Event
            </h3>
            <div className="mb-4 space-y-2 text-sm">
              {["Every Day", "Every Week", "Every Month"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setRepeatOption(freq)}
                  className={`block w-full rounded-xl p-2 text-left ${
                    repeatOption === freq
                      ? "border border-[#65D1F8] bg-[#E1F8FE] text-[#65D1F8]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <Label htmlFor="endDate" className="text-sm font-semibold">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-[#65D1F8]"
              />
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={() => setShowRepeatPopup(false)}
                className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] text-white hover:opacity-90"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
