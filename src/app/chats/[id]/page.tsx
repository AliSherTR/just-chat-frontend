"use client";
import { useParams } from "next/navigation";
import React, { useState, FormEvent } from "react";
import { Send } from "lucide-react";

export default function SingleChat() {
  const params = useParams();
  const chatGroupId = params?.id; // Assuming the route is like /chats/[id]
  const [message, setMessage] = useState("");

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: Implement message sending logic (e.g., API call)
    console.log("Sending message:", message);
    setMessage(""); // Clear input after sending
  };

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* Chat Header */}
      <div className="bg-white shadow-sm p-2 flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-600 font-semibold">U</span>{" "}
          {/* Placeholder for user avatar */}
        </div>
        <div className="ml-3">
          <h2 className="text-sm font-semibold text-gray-800">Chat Partner</h2>
          <p className="text-sm text-gray-500">Online</p>{" "}
          {/* Placeholder for status */}
        </div>
      </div>

      {/* Chat Content Area */}
      <div className="basis-[77%] overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {/* Example Messages */}
          <div className="flex justify-start">
            <div className="max-w-xs rounded-lg bg-white p-3 shadow-sm">
              <p className="text-sm text-gray-800">Hey, how's it going?</p>
              <span className="text-xs text-gray-400">10:30 AM</span>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-xs rounded-lg bg-blue-500 p-3 text-white shadow-sm">
              <p className="text-sm">All good here! You?</p>
              <span className="text-xs text-blue-100">10:32 AM</span>
            </div>
          </div>
          {/* Add more messages dynamically here */}
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
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
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
