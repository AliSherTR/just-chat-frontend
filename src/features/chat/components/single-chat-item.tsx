"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import useChats from "../api/useChats";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

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
  const { deleteChat, deleteChatLoading, deleteChatSuccess } = useChats();

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteChat(chatGroupId);
    if (deleteChatSuccess) {
      setIsAlertOpen(false);
    }
  };

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
    if (words.length > 2) {
      return words.slice(0, 2).join(" ") + "...";
    }
    return content;
  };

  return (
    <div className="flex items-center justify-between w-full">
      <Link href={`/chats/${chatGroupId}`} className="flex-1">
        <div className="py-1 px-2 flex items-center border rounded-3xl gap-2 transition">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
            {partnerProfilePic ? (
              <img
                src={partnerProfilePic || "/placeholder.svg"}
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
              } text-white flex items-center justify-center rounded-full`}
            >
              {unreadCount > 0 && unreadCount}
            </h1>
          </div>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="py-2 px-2">
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-xs hover:outline-0 flex items-center gap-2 cursor-pointer"
          >
            <Trash size={13} color="red" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-lg font-semibold mb-4">
            Are you sure you want to delete this chat?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600 mb-6 dark:text-white">
            This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-4">
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {deleteChatLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
