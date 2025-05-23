"use client";
import React, { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar";
import SingleChatItem from "@/features/chat/components/single-chat-item";
import { Button } from "./ui/button";
import { LoaderIcon, Plus } from "lucide-react";
import { Input } from "./ui/input";
import useChats from "@/features/chat/api/useChats";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import NewChatModal from "@/features/chat/components/new-chat-modal";

export default function AppSidebar() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const { chats, chatsLoading, chatsError } = useChats();
  const filteredChats =
    chats?.filter(
      (chat) =>
        chat.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.lastMessage?.content
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) ?? [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Sidebar>
        <SidebarHeader className="font-bold text-lg py-2 px-2">
          <h1 className="text-2xl mb-3 mt-2">My Messages</h1>
          <Input
            placeholder="Search Conversations"
            type="text"
            className="placeholder:text-xs placeholder:font-normal font-normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SidebarHeader>
        <SidebarContent className="px-3 py-2">
          <div className="flex items-center justify-center">
            <LoaderIcon className="animate-spin h-6 w-6 text-gray-500" />
            <span className="ml-2 text-sm text-gray-500">Loading Chats...</span>
          </div>
        </SidebarContent>
        <SidebarFooter className="mb-3">
          <Button variant="outline" className="flex items-center gap-3">
            <span>
              <Plus />
            </span>
            Add New Friend
          </Button>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="font-bold text-lg py-2 px-2">
        <h1 className="text-2xl mb-3 mt-2">My Messages</h1>
        <Input
          placeholder="Search Conversations"
          type="text"
          className="placeholder:text-xs placeholder:font-normal font-normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SidebarHeader>
      <SidebarContent className="px-3 py-2">
        {chatsLoading ? (
          <div className="flex items-center justify-center">
            <LoaderIcon className="animate-spin h-6 w-6 text-gray-500" />
            <span className="ml-2 text-sm text-gray-500">Loading Chats...</span>
          </div>
        ) : chatsError ? (
          <p className="text-sm text-red-500">Error: {chatsError.message}</p>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <SingleChatItem
              key={chat.chatGroupId}
              chatGroupId={chat.chatGroupId}
              partnerId={chat.partnerId}
              partnerProfilePic={chat.partnerProfilePic}
              partnerName={chat.partnerName}
              lastMessage={
                chat.lastMessage ?? {
                  id: "",
                  content: "",
                  emoji: "",
                  createdAt: "",
                  isSentByUser: false,
                }
              }
              unreadCount={chat.unreadCount}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">No conversations found</p>
        )}
      </SidebarContent>
      <SidebarFooter className="mb-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-3">
              <span>
                <Plus />
              </span>
              Add New Friend
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogTitle>Start a new Conversation</AlertDialogTitle>
            <NewChatModal />
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
