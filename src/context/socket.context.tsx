"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const WS_URL = process.env.NEXT_PUBLIC_WS_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!WS_URL || !token) {
      console.error("WebSocket URL or token missing");
      return;
    }

    socketRef.current = io(`${WS_URL}/chat`, {
      auth: { token },
      extraHeaders: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    socketRef.current.on("error", (err: { message: string }) => {
      console.error("WebSocket error:", err.message);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [WS_URL, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
