// src/components/chat/ChatPage.tsx
import { Camera, Search, Smile } from "lucide-react";
import { useState } from "react";

// Import local images for Beth and Ploy
import bethPic from "@/components/bethpic.png";
import mearzPic from "@/components/mearzpic.png";

type Friend = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
};

type Message = {
  from: string;
  text: string;
  time: string;
};

export default function ChatPage() {
  // Mock data for demonstration
  const mockFriends: Friend[] = [
    {
      id: "beth",
      name: "Beth Elizabeth",
      avatar: bethPic,
      lastMessage: "Sure! Should we meet up at 4pm?",
      lastTime: "10:48 AM",
      unreadCount: 2,
    },
    {
      id: "ploy",
      name: "Ploy Panpailin",
      avatar: mearzPic,
      lastMessage: "Start a message with Ploy!",
      lastTime: "9:45 AM",
      unreadCount: 0,
    },
  ];

  const mockMessages: Message[] = [
    { from: "beth", text: "Hello!", time: "10:26 AM" },
    { from: "me", text: "Hi!! :))", time: "10:27 AM" },
    { from: "beth", text: "Sure! Should we meet up at 4pm?", time: "10:28 AM" },
  ];

  // States
  const [search, setSearch] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<string>("beth");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [draft, setDraft] = useState("");

  // Filter friends by search text
  const filteredFriends = mockFriends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Get the active friend from the list
  const activeFriend = mockFriends.find((f) => f.id === selectedFriend);

  // Handler to send a new message
  const handleSend = () => {
    if (!draft.trim()) return;
    const newMessage: Message = {
      from: "me",
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setDraft("");
  };

  return (
    // Parent container fills the screen height
    <div className="flex h-full">
      {/* LEFT COLUMN: Friends List */}
      <aside className="flex w-96 flex-col overflow-y-auto border-r bg-[#E1F8FE] p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-700 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="mb-2 font-semibold text-gray-700">Friends</div>
        {/* Friends List */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filteredFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setSelectedFriend(friend.id)}
              className={`flex w-full items-center rounded-xl px-2 py-2 text-left hover:bg-white ${
                friend.id === selectedFriend
                  ? "border-2 border-[#65D1F8] bg-white"
                  : ""
              }`}
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="mr-2 h-10 w-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{friend.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {friend.lastMessage}
                </p>
              </div>
              <div className="ml-2 flex flex-col items-end">
                <span className="text-xs text-gray-500">{friend.lastTime}</span>
                {friend.unreadCount && friend.unreadCount > 0 && (
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#65D1F8] text-xs text-white">
                    {friend.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* RIGHT COLUMN: Chat Panel */}
      <main className="flex flex-1 flex-col bg-white">
        {/* Header: Friend Info */}
        {activeFriend ? (
          <div className="flex items-center border-b p-4">
            <img
              src={activeFriend.avatar}
              alt={activeFriend.name}
              className="mr-3 h-10 w-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <p className="font-semibold text-gray-800">{activeFriend.name}</p>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
        ) : (
          <div className="border-b p-4 text-gray-600">
            Select a friend to start chatting
          </div>
        )}

        {/* Scrollable Messages Area */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {activeFriend ? (
            messages.map((msg, idx) => {
              const isMe = msg.from === "me";
              return (
                <div
                  key={idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} items-center space-x-2`}
                >
                  {!isMe && (
                    <img
                      src={activeFriend.avatar}
                      alt={activeFriend.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isMe
                        ? "bg-[#65D1F8] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
              );
            })
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No friend selected.
            </div>
          )}
        </div>

        {/* Footer: Message Input and Extra Buttons */}
        {activeFriend && (
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
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="rounded-full bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
            >
              Send
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
