// src/components/chat/ChatPanel.tsx
import { Friend } from "@/components/friendslist";
import { Camera, Smile } from "lucide-react";
import React from "react";

type Message = {
  from: string;
  text: string;
  time: string;
};

type ChatPanelProps = {
  friend?: Friend;
  messages: Message[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export default function ChatPanel({
  friend,
  messages,
  draft,
  onDraftChange,
  onSend,
}: ChatPanelProps) {
  if (!friend) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center bg-white p-4 text-gray-500">
        <p>No friend selected.</p>
      </main>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <main className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="flex items-center border-b p-4">
        <img
          src={friend.avatar}
          alt={friend.name}
          className="mr-3 h-10 w-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-gray-800">{friend.name}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>
      {/* Messages area: only this area scrolls */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((msg, idx) => {
          const isMe = msg.from === "me";
          return (
            <div
              key={idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-center space-x-2`}
            >
              {!isMe && (
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  isMe ? "bg-[#65D1F8] text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-xs text-gray-400">{msg.time}</span>
            </div>
          );
        })}
      </div>
      {/* Footer: message input */}
      <div className="flex items-center border-t p-4">
        <button className="mr-2 rounded-full p-2 hover:bg-gray-100">
          <Smile className="h-5 w-5 text-gray-500" />
        </button>
        <button className="mr-2 rounded-full p-2 hover:bg-gray-100">
          <Camera className="h-5 w-5 text-gray-500" />
        </button>
        <input
          type="text"
          className="mr-2 flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none"
          placeholder="Write Something..."
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={onSend}
          className="rounded-full bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
        >
          Send
        </button>
      </div>
    </main>
  );
}
