// src/components/chat/FriendsList.tsx
import React from "react";
import { Search } from "lucide-react";

export type Friend = {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;
};

type FriendsListProps = {
  friends: Friend[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedFriend: string;
  onSelectFriend: (friendId: string) => void;
};

export default function FriendsList({
  friends,
  search,
  onSearchChange,
  selectedFriend,
  onSelectFriend,
}: FriendsListProps) {
  return (
    <aside className="flex w-96 flex-col overflow-y-auto border-r bg-[#E1F8FE] p-4">
      <div className="relative mb-4">
        <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-full border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-700 focus:outline-none"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="mb-2 font-semibold text-gray-700">Friends</div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {friends.map((friend) => (
          <button
            key={friend.id}
            onClick={() => onSelectFriend(friend.id)}
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
              {friend.lastTime && (
                <span className="text-xs text-gray-500">{friend.lastTime}</span>
              )}
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
  );
}
