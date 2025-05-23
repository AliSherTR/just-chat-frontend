"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "@/context/socket.context";

// Define types for the API response
interface Message {
  id: string;
  content: string;
  emoji: string;
  createdAt: string;
  isSentByUser: boolean;
}

interface Chat {
  chatGroupId: string;
  partnerId: string;
  partnerName: string;
  partnerProfilePic: string | null;
  lastMessage: Message | null;
  unreadCount: number;
}

interface SingleChat {
  chatGroupId: string;
  partner: {
    id: string;
    name: string;
    profilePic: string | null;
  };
  messages: Message[];
}

interface SingleChatResponse {
  status: string;
  message: string;
  data: SingleChat;
  errors: string | null;
}

export default function useConversation(groupId: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  async function getSingleConversation(): Promise<SingleChat> {
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_URL}/chats/${groupId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chat");
    }

    const data: SingleChatResponse = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Failed to fetch chat");
    }

    return data.data;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["singleChat"],
    queryFn: getSingleConversation,
  });

  //   useEffect(() => {
  //     if (!socket || !isConnected) return;

  //     socket.on("chatUpdated", (chat: Chat) => {
  //       console.log("socket chatUpdated:", chat);
  //       queryClient.setQueryData(["chats"], (oldData: Chat[] | undefined) => {
  //         if (!oldData) return [chat];
  //         const existingChatIndex = oldData.findIndex(
  //           (c) => c.chatGroupId === chat.chatGroupId
  //         );
  //         if (existingChatIndex !== -1) {
  //           const updatedChats = [...oldData];
  //           updatedChats[existingChatIndex] = chat;
  //           return updatedChats.sort((a, b) =>
  //             a.lastMessage && b.lastMessage
  //               ? new Date(b.lastMessage.createdAt).getTime() -
  //                 new Date(a.lastMessage.createdAt).getTime()
  //               : 0
  //           );
  //         }
  //         return [chat, ...oldData].sort((a, b) =>
  //           a.lastMessage && b.lastMessage
  //             ? new Date(b.lastMessage.createdAt).getTime() -
  //               new Date(a.lastMessage.createdAt).getTime()
  //             : 0
  //         );
  //       });
  //     });

  //     socket.on("error", (err: { message: string }) => {
  //       console.error("WebSocket error:", err.message);
  //     });

  //     return () => {
  //       socket.off("chatUpdated");
  //       socket.off("error");
  //     };
  //   }, [socket, isConnected, queryClient]);

  return {
    conversation: data,
    conversationLoading: isLoading,
  };
}
