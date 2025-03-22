import { useRouter } from "@tanstack/react-router";
import React, { useState } from "react";

type EventJoinFlowProps = {
  title: string;
  dateTime: string;
  location: string;
  image: string;
};

export default function EventJoinFlow({
  title,
  dateTime,
  location,
  image,
}: EventJoinFlowProps) {
  const router = useRouter();
  // Steps: NONE => no popup, JOIN => first popup, CONGRATS => second popup
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
    router.navigate({ to: "/events" });
  }

  function handleClose() {
    // Close the popup and navigate back
    setPopUpStep("NONE");
    router.navigate({ to: "/events" });
  }

  // Stop event from bubbling to the overlay
  function stopPropagation(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="space-y-4">
      {/* Event card */}
      <div className="w-80 rounded bg-white p-4 shadow">
        <img
          src={image}
          alt={title}
          className="h-40 w-full rounded object-cover"
        />
        <h3 className="mt-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{dateTime}</p>
        <p className="mb-2 text-sm text-gray-600">{location}</p>
        <button
          onClick={handleJoinClick}
          className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
        >
          Join
        </button>
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
              src={image}
              alt={title}
              className="h-32 w-full rounded object-cover"
            />
            <h4 className="mt-2 text-lg font-semibold">{title}</h4>
            <p className="text-sm text-gray-600">{dateTime}</p>
            <p className="mb-2 text-sm text-gray-600">{location}</p>

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
              src={image}
              alt={title}
              className="h-32 w-full rounded object-cover"
            />
            <h4 className="mt-2 text-lg font-semibold">{title}</h4>
            <p className="text-sm text-gray-600">{dateTime}</p>
            <p className="mb-2 text-sm text-gray-600">{location}</p>

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
