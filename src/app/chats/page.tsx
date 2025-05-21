import { MessageCircle } from "lucide-react";
import React from "react";

export default function Messages() {
  return (
    <div className=" h-full w-full flex items-center justify-center flex-col bg-green-50">
      <MessageCircle size={80} className=" block mb-5" />
      <h1 className=" font-semibold text-2xl mb-3">No Conversation Selected</h1>
      <p>
        Select a conversation from the sidebar or start a new one by adding a
        friend.
      </p>
    </div>
  );
}
