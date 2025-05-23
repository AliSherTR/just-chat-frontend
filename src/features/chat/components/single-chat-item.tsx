"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

type SideBarChatItemProps = {
  chatGroupId: string;
  partnerId: string;
  partnerName: string;
  partnerProfilePic: string | null;
  lastMessage: {
    id: string;
    content: string;
    emoji: string;
    createdAt: string;
    isSentByUser: boolean;
  };
  unreadCount: number;
};

export default function SingleChatItem({
  chatGroupId,
  partnerName,
  partnerProfilePic,
  lastMessage,
  unreadCount,
}: SideBarChatItemProps) {
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    function formatTimestamp(createdAt: string): string {
      const date = new Date(createdAt);
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }

    setFormattedTime(formatTimestamp(lastMessage.createdAt));
  }, [lastMessage.createdAt]);

  const truncateMessage = (content: string): string => {
    const words = content.split(" ");
    if (words.length > 3) {
      return words.slice(0, 3).join(" ") + "...";
    }
    return content;
  };

  return (
    <Link href={`/chats/${chatGroupId}`}>
      <div className="py-1 px-2 flex items-center border rounded-3xl gap-2 transition">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
          {partnerProfilePic ? (
            <img
              src={partnerProfilePic}
              alt={`${partnerName} avatar`}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            partnerName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="text-xs flex-1 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-gray-800 dark:text-white">
              {partnerName}
            </h1>

            <span className="truncate text-gray-600 dark:text-white">
              {lastMessage.isSentByUser ? "You: " : ""}
              {truncateMessage(lastMessage.content)}
              {lastMessage.emoji && ` ${lastMessage.emoji}`}
            </span>
          </div>
        </div>
        <div className="justify-self-end flex items-center gap-3 text-xs">
          <p className="text-right text-gray-500 dark:text-white">
            {formattedTime}
          </p>
          <h1
            className={`w-6 h-6 ${
              unreadCount > 0 ? "bg-green-800" : "bg-transparent"
            } text-white  flex items-center justify-center rounded-full`}
          >
            {unreadCount > 0 && unreadCount}
          </h1>
        </div>
      </div>
    </Link>
  );
}
