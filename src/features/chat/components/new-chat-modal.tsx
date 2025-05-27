"use client";

import React, { useState } from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/context/socket.context";
import { useUser } from "@/context/user.context";
import { useRouter } from "next/navigation";
import type { Message } from "@/features/chat/types";
import { toast } from "sonner";

export default function NewChatModal({
  onMessageSent,
}: {
  onMessageSent?: (tempMessage: Message, chatGroupId: string) => void;
}) {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverEmail.trim() || !content.trim()) {
      setError("Email and message are required");
      return;
    }
    if (!socket || !isConnected) {
      setError("Not connected to server");
      return;
    }
    const tempMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      senderId: user?.id || "",
      content: content.trim(),
      emoji: "",
      createdAt: new Date().toISOString(),
      isRead: false,
      isSentByUser: true,
      isPending: true,
    };
    socket.emit("sendMessage", {
      receiverEmail: receiverEmail.trim(),
      content: content.trim(),
    });
    socket.once("chatUpdated", (chatData) => {
      if (onMessageSent) {
        onMessageSent(tempMessage, chatData.chatGroupId);
      }
      router.push(`/chats/${chatData.chatGroupId}`);
    });

    socket.once("error", (err: { message: string }) => {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    });

    // Clear inputs
    setReceiverEmail("");
    setContent("");
    setError(null);
  };

  return (
    <>
      <AlertDialogDescription>
        Enter the receiver's email address and type your message to start a new
        conversation
      </AlertDialogDescription>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <Input
            placeholder="Enter the receiver's email"
            type="email"
            className="mb-4"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
          />
          <Textarea
            placeholder="Type your message here."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className=" mb-4"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogAction type="submit">Send Message</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </form>
    </>
  );
}
