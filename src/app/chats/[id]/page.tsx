"use client";

import { useParams } from "next/navigation";
import React, { useState, FormEvent, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useSocket } from "@/context/socket.context";
import { useUser } from "@/context/user.context";
import type {
  ChatUpdatedData,
  Message,
  SingleChat,
  SingleChatResponse,
} from "@/features/chat/types";

export default function SingleChat() {
  const { user } = useUser();
  const params = useParams();
  const chatGroupId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";
  const [conversation, setConversation] = useState<SingleChat | null>(null);
  const [conversationLoading, setConversationLoading] = useState(true);
  const [conversationError, setConversationError] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]); // Track pending messages
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  async function getSingleConversation() {
    if (!token || !chatGroupId) {
      setConversationError("No access token or chat group ID");
      setConversationLoading(false);
      return;
    }

    try {
      setConversationLoading(true);
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

      setConversation(data.data);
      setConversationError(null);
    } catch (error: any) {
      setConversationError(error.message || "Failed to fetch chat");
    } finally {
      setConversationLoading(false);
    }
  }

  useEffect(() => {
    getSingleConversation();
  }, [chatGroupId]);

  useEffect(() => {
    if (!socket || !isConnected || !chatGroupId) {
      return;
    }

    socket.on("chatUpdated", (chatData: ChatUpdatedData) => {
      if (chatData.chatGroupId === chatGroupId) {
        setConversation((prev) => {
          if (!prev) {
            return prev;
          }
          const newMessage: Message = {
            id: chatData.lastMessage.id,
            senderId: chatData.lastMessage.senderId || chatData.partnerId,
            content: chatData.lastMessage.content,
            emoji: chatData.lastMessage.emoji || "",
            createdAt: chatData.lastMessage.createdAt,
            isRead: false,
            isSentByUser: chatData.lastMessage.senderId === user?.id,
            isPending: false,
          };

          // Remove the pending message with the same content
          setPendingMessages((prevPending) =>
            prevPending.filter((msg) => msg.content !== newMessage.content)
          );

          const messageExists = prev.messages.some(
            (msg) => msg.id === newMessage.id
          );
          if (messageExists) {
            return prev;
          }
          const updatedMessages = [...prev.messages, newMessage];

          return {
            ...prev,
            partner: {
              id: chatData.partnerId,
              name: chatData.partnerName,
              profilePic: chatData.partnerProfilePic,
            },
            messages: updatedMessages,
          };
        });
      }
    });

    socket.on("error", (err: { message: string }) => {
      // Remove pending messages on error
      setPendingMessages([]);
      window.location.reload();
    });

    return () => {
      socket.off("chatUpdated");
      socket.off("error");
    };
  }, [socket, isConnected, chatGroupId, user?.id]);

  useEffect(() => {
    if (messagesEndRef.current && (conversation?.messages || pendingMessages)) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages, pendingMessages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !isConnected || !conversation) {
      console.log("Cannot send message:", {
        message,
        isConnected,
        hasConversation: !!conversation,
      });
      return;
    }

    // Create a temporary message
    const tempMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`, // Unique temporary ID
      senderId: user?.id || "",
      content: message,
      emoji: "",
      createdAt: new Date().toISOString(),
      isRead: false,
      isSentByUser: true,
      isPending: true, // Flag for pending messages
    };

    // Add to pending messages
    setPendingMessages((prev) => [...prev, tempMessage]);

    // Emit the message to the server
    socket.emit("sendMessage", {
      recipientId: conversation.partner.id,
      content: message,
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

  if (conversationLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-white text-black">
        Loading...
      </div>
    );
  }

  if (conversationError || !conversation) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        {conversationError || "No conversation found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100">
      {/* Chat Header */}
      <div className="bg-white shadow-sm p-4 flex items-center shrink-0">
        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
          {conversation.partner.profilePic ? (
            <img
              src={conversation.partner.profilePic}
              alt={`${conversation.partner.name} avatar`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-semibold">
              {conversation.partner.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {conversation.partner.name}
          </h2>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {/* Render confirmed messages */}
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isSentByUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-lg p-3 shadow-sm ${
                  msg.isSentByUser
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                {msg.emoji && <span className="text-sm">{msg.emoji}</span>}
                <span
                  className={`text-xs ${
                    msg.isSentByUser ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {formatTimestamp(msg.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {/* Render pending messages */}
          {pendingMessages.map((msg) => (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-xs rounded-lg p-3 shadow-sm bg-blue-500 text-white opacity-60 blur-[2px]">
                <p className="text-sm">{msg.content}</p>
                {msg.emoji && <span className="text-sm">{msg.emoji}</span>}
                <span className="text-xs text-blue-100">
                  {formatTimestamp(msg.createdAt)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Typing Area */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white p-4 border-t border-gray-200 shrink-0"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black"
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
