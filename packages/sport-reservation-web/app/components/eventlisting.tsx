// src/components/EventListing.tsx
import { Link } from "@tanstack/react-router"; // Import Link from TanStack Router
import { MapPin, Users } from "lucide-react"; // or your icon library
import React, { useState } from "react";

type EventListingProps = {
  eventId: string; // Ensure eventId is provided
  image?: string;
  dateTime: string;
  name?: string;
  description?: string;
  locationDescription?: string;
  participants: number;
  buttonLabel?: string;
};

export default function EventListing({
  eventId,
  dateTime,
  name,
  description,
  locationDescription,
  participants,
  buttonLabel = "Join",
}: EventListingProps) {
  const [popUpStep, setPopUpStep] = useState<"NONE" | "JOIN" | "CONGRATS">(
    "NONE",
  );
  const [guests, setGuests] = useState(0);

  function handleJoinClick() {
    setPopUpStep("JOIN");
  }

  function handleConfirm() {
    setPopUpStep("CONGRATS");
  }

  function handleDone() {
    setPopUpStep("NONE");
    setGuests(0);
  }

  function handleClose() {
    setPopUpStep("NONE");
    setGuests(0);
  }

  function stopPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div>
      {/* Event Card Layout */}
      <div className="mb-4 flex max-w-3xl space-x-4 rounded-md bg-white p-4 shadow">
        {/* Bigger Event Image */}
        <img
          src="https://cdn.theerapakg.moe/reservation/asset/events/badminton-default.jpg"
          alt={name}
          className="h-32 w-48 rounded-md object-cover"
        />

        {/* Event Details */}
        <div className="flex w-full flex-col justify-between">
          <div>
            <p className="mb-1 text-sm text-[#F28382]">{dateTime}</p>
            {/*
              Using an absolute link to ensure the URL is correct.
              This will navigate to: /_layout/events/{eventId}
            */}
            <Link
              to={`/events/$eventId`}
              params={{ eventId }}
              className="mb-1 block text-base font-semibold text-blue-600 underline"
            >
              {name}
            </Link>
            <p className="mb-2 text-sm text-gray-600">{description}</p>
            <p className="mb-2 flex items-center text-sm text-gray-600">
              <MapPin size={16} className="mr-1" />
              {locationDescription}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Users size={16} className="mr-1" />
              {participants}
            </div>
            <button
              onClick={handleJoinClick}
              className="rounded-md bg-[#65D1F8] px-4 py-1 text-sm text-white hover:bg-[#4A90E2]"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>

      {/* FIRST POPUP: "Are you bringing anyone?" */}
      {popUpStep === "JOIN" && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={handleClose}
        >
          <div
            className="w-80 rounded bg-white p-4 shadow"
            onClick={stopPropagation}
          >
            <img
              src="https://cdn.theerapakg.moe/reservation/asset/events/badminton-default.jpg"
              alt={name}
              className="h-32 w-full rounded object-cover"
            />
            <h4 className="mt-2 text-lg font-semibold">{name}</h4>
            <p className="text-sm text-gray-600">{dateTime}</p>
            <p className="mb-2 text-sm text-gray-600">{locationDescription}</p>

            <div className="mb-2 text-center text-lg font-semibold">
              Are you bringing anyone?
            </div>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setGuests((g) => Math.max(0, g - 1))}
                className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <span className="text-lg">{guests}</span>
              <button
                onClick={() => setGuests((g) => g + 1)}
                className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <button
                onClick={handleConfirm}
                className="mb-2 w-full rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
              >
                Confirm
              </button>
              <button
                onClick={handleClose}
                className="w-full rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECOND POPUP: "Congrats!" */}
      {popUpStep === "CONGRATS" && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={handleClose}
        >
          <div
            className="w-80 rounded bg-white p-4 shadow"
            onClick={stopPropagation}
          >
            <h2 className="mb-2 text-center text-xl font-bold">Congrats!</h2>
            <p className="mb-4 text-center text-gray-700">
              You're going to this event!
            </p>
            <img
              src="https://cdn.theerapakg.moe/reservation/asset/events/badminton-default.jpg"
              alt={name}
              className="h-32 w-full rounded object-cover"
            />
            <h4 className="mt-2 text-lg font-semibold">{name}</h4>
            <p className="text-sm text-gray-600">{dateTime}</p>
            <p className="mb-2 text-sm text-gray-600">{locationDescription}</p>
            <div className="mt-4 flex flex-col items-center">
              <button
                onClick={handleDone}
                className="mb-2 w-full rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
              >
                Done
              </button>
              <button
                onClick={handleClose}
                className="w-full rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
