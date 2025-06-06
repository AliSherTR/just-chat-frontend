"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "@/context/socket.context";
import { Chat, ChatsResponse } from "../types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function useChats() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  async function getChats(): Promise<Chat[]> {
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_URL}/chats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    const data: ChatsResponse = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Failed to fetch chats");
    }

    return data.data;
  }

  async function deleteChat(chatGroupId: string): Promise<void> {
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_URL}/chats/${chatGroupId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete chat");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Failed to delete chat");
    }
  }

  const deleteChatMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("Chat deleted successfully");
      router.push("/chats");
    },
    onError: (error: Error) => {
      toast.error(`Error deleting chat: ${error.message}`);
    },
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
    enabled: !!token,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("chatUpdated", (chat: Chat) => {
      queryClient.setQueryData(["chats"], (oldData: Chat[] | undefined) => {
        if (!oldData) return [chat];
        const existingChatIndex = oldData.findIndex(
          (c) => c.chatGroupId === chat.chatGroupId
        );
        if (existingChatIndex !== -1) {
          const updatedChats = [...oldData];
          updatedChats[existingChatIndex] = chat;
          return updatedChats.sort((a, b) =>
            a.lastMessage && b.lastMessage
              ? new Date(b.lastMessage.createdAt).getTime() -
                new Date(a.lastMessage.createdAt).getTime()
              : 0
          );
        }
        return [chat, ...oldData].sort((a, b) =>
          a.lastMessage && b.lastMessage
            ? new Date(b.lastMessage.createdAt).getTime() -
              new Date(a.lastMessage.createdAt).getTime()
            : 0
        );
      });
    });

    socket.on("error", (err: { message: string }) => {
      console.error("WebSocket error:", err.message);
    });

    return () => {
      socket.off("chatUpdated");
      socket.off("error");
    };
  }, [socket, isConnected, queryClient]);

  return {
    chats: data ?? [],
    chatsLoading: isLoading,
    chatsError: error,
    refetch,

    deleteChat: deleteChatMutation.mutate,
    deleteChatLoading: deleteChatMutation.isPending,
    deleteChatError: deleteChatMutation.error,
    deleteChatSuccess: deleteChatMutation.isSuccess,
  };
}
