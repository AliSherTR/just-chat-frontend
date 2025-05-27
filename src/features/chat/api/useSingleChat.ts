"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/socket.context";
import { useUser } from "@/context/user.context";
import type {
  ChatUpdatedData,
  Message,
  SingleChat,
  SingleChatResponse,
} from "@/features/chat/types";

export default function useSingleChat() {
  const { user } = useUser();
  const params = useParams();
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const chatGroupId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";
  const [message, setMessage] = useState("");
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);

  async function getSingleConversation(): Promise<SingleChat> {
    if (!token || !chatGroupId) {
      throw new Error("No access token or chat group ID");
    }

    const response = await fetch(`${API_URL}/chats/${chatGroupId}`, {
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

    await markMessagesAsRead();
    return data.data;
  }

  async function markMessagesAsRead() {
    if (!token || !chatGroupId) {
      throw new Error("No access token or chat group ID");
    }

    try {
      const response = await fetch(
        `${API_URL}/chats/markMessagesAsRead/?id=${chatGroupId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Failed to mark messages as read");
      }

      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.setQueryData(
        ["singleChat", chatGroupId],
        (oldData: SingleChat | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            messages: oldData.messages.map((msg) => ({
              ...msg,
              isRead: true,
            })),
          };
        }
      );
    } catch (error: any) {
      console.error("Error marking messages as read:", error.message);
    }
  }

  const {
    data: conversation,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["singleChat", chatGroupId],
    queryFn: getSingleConversation,
    enabled: !!token && !!chatGroupId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!socket || !isConnected || !chatGroupId) return;

    socket.on("chatUpdated", (chatData: ChatUpdatedData) => {
      if (chatData.chatGroupId === chatGroupId) {
        queryClient.setQueryData(
          ["singleChat", chatGroupId],
          (prev: SingleChat | undefined) => {
            if (!prev) return prev;
            const newMessage: Message = {
              id: chatData.lastMessage.id,
              senderId: chatData.lastMessage.senderId || chatData.partnerId,
              content: chatData.lastMessage.content,
              emoji: chatData.lastMessage.emoji || "",
              createdAt: chatData.lastMessage.createdAt,
              isRead: chatData.lastMessage.senderId === user?.id, // Mark as read if sent by user
              isSentByUser: chatData.lastMessage.senderId === user?.id,
              isPending: false,
            };

            // Remove the pending message with matching tempId (for sender only)
            if (
              chatData.lastMessage.tempId &&
              chatData.lastMessage.senderId === user?.id
            ) {
              setPendingMessages((prevPending) =>
                prevPending.filter(
                  (msg) => msg.id !== chatData.lastMessage.tempId
                )
              );
            }

            const messageExists = prev.messages.some(
              (msg) => msg.id === newMessage.id
            );
            if (messageExists) return prev;

            const updatedMessages = [...prev.messages, newMessage];
            const updatedConversation = {
              ...prev,
              partner: {
                id: chatData.partnerId,
                name: chatData.partnerName,
                profilePic: chatData.partnerProfilePic,
              },
              messages: updatedMessages,
            };

            // If the message is from the other user, mark it as read
            if (chatData.lastMessage.senderId !== user?.id) {
              markMessagesAsRead();
            }

            return updatedConversation;
          }
        );
      }
    });

    socket.on("error", (err: { message: string }) => {
      setPendingMessages([]);
      return;
    });

    return () => {
      socket.off("chatUpdated");
      socket.off("error");
    };
  }, [socket, isConnected, chatGroupId, user?.id, queryClient]);

  useEffect(() => {
    if (messagesEndRef.current && (conversation?.messages || pendingMessages)) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages, pendingMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !isConnected || !conversation) {
      console.log("Cannot send message:", {
        message,
        isConnected,
        hasConversation: !!conversation,
      });
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: Message = {
      id: tempId,
      senderId: user?.id || "",
      content: message,
      emoji: "",
      createdAt: new Date().toISOString(),
      isRead: false,
      isSentByUser: true,
      isPending: true,
    };

    setPendingMessages((prev) => [...prev, tempMessage]);

    socket.emit("sendMessage", {
      recipientId: conversation.partner.id,
      content: message,
      tempId,
    });

    setMessage("");
  };

  const formatTimestamp = (createdAt: string): string => {
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
  };

  return {
    conversation,
    conversationLoading: isLoading,
    conversationError: error ? error.message : null,
    message,
    setMessage,
    pendingMessages,
    messagesEndRef,
    handleSendMessage,
    formatTimestamp,
    refetch,
  };
}
