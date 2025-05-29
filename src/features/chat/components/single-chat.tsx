"use client";

import { ArrowLeft, CheckCheck, Send, Video } from "lucide-react";
import useSingleChat from "@/features/chat/api/useSingleChat";
import useVideoCall from "@/features/chat/api/useVideoCall";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/socket.context";

export default function SingleChat() {
  const { socket } = useSocket();
  const {
    conversation,
    conversationLoading,
    conversationError,
    message,
    setMessage,
    pendingMessages,
    messagesEndRef,
    handleSendMessage,
    formatTimestamp,
  } = useSingleChat();

  const router = useRouter();
  const {
    callStatus,
    localVideoRef,
    remoteVideoRef,
    error: callError,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  } = useVideoCall(conversation?.partner.id || "");

  const [incomingCaller, setIncomingCaller] = useState<{
    callerId: string;
    callerName?: string;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "incomingCall",
      (caller: { callerId: string; callerName?: string }) => {
        setIncomingCaller(caller);
      }
    );

    return () => {
      socket.off("incomingCall");
    };
  }, []);

  const clearIncomingCall = () => {
    setIncomingCaller(null);
  };

  if (conversationLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white text-black">
        <span>Loading...</span>
      </div>
    );
  }

  if (!conversation || conversationError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white text-black">
        <span className="mb-3">
          {conversationError || "No conversation found"}
        </span>
        <Button
          variant="outline"
          className="flex gap-3 items-center"
          onClick={() => router.push("/chats")}
        >
          <ArrowLeft className="h-4 w-4" color="black" />
          <span>Back to Chats</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100">
      {/* Chat Header */}
      <div className="shadow-sm p-4 flex items-center gap-2 shrink-0 border-b bg-white">
        <ArrowLeft
          className="h-4 w-4 cursor-pointer"
          color="black"
          onClick={() => router.push("/chats")}
        />
        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
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
        <div className="ml-2">
          <h2 className="text-lg font-semibold text-gray-800">
            {conversation.partner.name}
          </h2>
        </div>
        <div className="flex-1 flex justify-end me-4">
          {callStatus === "idle" && (
            <Button
              variant="ghost"
              className="p-2"
              onClick={startCall}
              aria-label="Start video call"
            >
              <Video size={24} color="black" />
            </Button>
          )}
          {(callStatus === "calling" || callStatus === "in-call") && (
            <Button
              variant="destructive"
              className="p-2 bg-red-500 hover:bg-red-600"
              onClick={endCall}
              aria-label="End call"
            >
              End Call
            </Button>
          )}
        </div>
      </div>

      {/* Video Call Area (always rendered, hidden when not in call) */}
      <div
        className={`bg-black py-4 flex justify-center gap-4 ${
          callStatus === "calling" || callStatus === "in-call"
            ? "block"
            : "hidden"
        }`}
      >
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full rounded-lg object-cover"
          />
          <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-1 rounded">
            You
          </span>
        </div>
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-96 h-64 rounded-lg object-cover"
          />
          <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-1 rounded">
            {conversation.partner.name}
          </span>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {callStatus === "incoming" && incomingCaller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Incoming call from {incomingCaller.callerName || "Unknown"}
            </h3>
            <div className="flex gap-4">
              <Button
                variant="default"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => {
                  acceptCall();
                  clearIncomingCall();
                }}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  rejectCall(incomingCaller.callerId);
                  clearIncomingCall();
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {callError && (
        <div className="p-4 bg-red-100 text-red-700 border-b border-red-300">
          {callError}
        </div>
      )}

      {/* Chat Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
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
                  className={`text-xs flex items-center mt-2 ${
                    msg.isSentByUser ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {formatTimestamp(msg.createdAt)}
                  <span className="mx-3">
                    {msg.isRead && msg.isSentByUser && (
                      <CheckCheck className="ms-auto" size={15} color="white" />
                    )}
                  </span>
                </span>
              </div>
            </div>
          ))}
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
