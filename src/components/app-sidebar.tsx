import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar";
import SingleChatItem from "@/features/chat/components/single-chat-item";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Input } from "./ui/input";

const chats = [
  {
    chatGroupId: "cmaxode9o0001fo0xyo2zej28",
    partnerId: "cmaw3mkw50001gq0xd9mqb9hf",
    partnerName: "bilal",
    partnerProfilePic: null,
    lastMessage: {
      id: "164d35e4-5049-4067-864c-e8694bad5638",
      content: "Hello from Socket One second message",
      emoji: "",
      createdAt: "2025-05-21T08:22:33.419Z",
      isSentByUser: true,
    },
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className=" font-bold text-lg py-2 px-2">
        <h1 className=" text-2xl mb-3 mt-2">My Messages</h1>
        <Input
          placeholder="Search Conversations"
          className=" placeholder:text-xs placeholder:font-normal font-normal"
        />
      </SidebarHeader>
      <SidebarContent className=" px-3 py-2">
        {chats.map((chat) => (
          <SingleChatItem
            key={chat.chatGroupId}
            chatGroupId={chat.chatGroupId}
            partnerId={chat.partnerId}
            partnerProfilePic={chat.partnerProfilePic}
            partnerName={chat.partnerName}
            lastMessage={chat.lastMessage}
          />
        ))}
      </SidebarContent>
      <SidebarFooter className=" mb-6">
        <Button variant={"outline"} className=" flex items-center gap-3">
          <span>
            <Plus />
          </span>
          Add New Friend
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
