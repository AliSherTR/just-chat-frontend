"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/socket.context";
import { useUser } from "@/context/user.context";

// Define types for WebRTC signaling data
interface CallPayload {
  callerId: string;
  callerName?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  answererId?: string;
  rejecterId?: string;
  senderId: string;
}

// Define call status enum
type CallStatus = "idle" | "calling" | "incoming" | "in-call" | "ended";

export default function useVideoCall(recipientId: string) {
  const { user } = useUser();
  const { socket, isConnected } = useSocket();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  // Queue for ICE candidates received before remote description is set
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

  // Helper function to create and configure a new RTCPeerConnection
  const createPeerConnection = () => {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    const pc = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("iceCandidate", {
          recipientId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setCallStatus("in-call");
      } else if (
        state === "disconnected" ||
        state === "failed" ||
        state === "closed"
      ) {
        endCall();
      }
    };

    return pc;
  };

  // Set up Socket.IO event listeners (no peer connection creation here)
  useEffect(() => {
    if (!socket || !isConnected || !recipientId || !user?.id) return;

    // Socket.IO event listeners
    socket.on("incomingCall", ({ callerId, callerName }: CallPayload) => {
      setCallStatus("incoming");
      setError(null);
      // Store caller info in component state (handled in SingleChat)
    });

    socket.on("offer", async ({ callerId, offer }: CallPayload) => {
      if (!offer) return;
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("answer", { callerId, answer });
        setCallStatus("in-call");

        // Process queued ICE candidates
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          if (candidate) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        }
      } catch (err) {
        setError("Failed to process offer");
        console.error("Error processing offer:", err);
      }
    });

    socket.on("answer", async ({ answer, answererId }: CallPayload) => {
      if (!peerConnectionRef.current || !answer) return;
      try {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setCallStatus("in-call");

        // Process queued ICE candidates
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          if (candidate) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        }
      } catch (err) {
        setError("Failed to process answer");
        console.error("Error processing answer:", err);
      }
    });

    socket.on("iceCandidate", async ({ candidate, senderId }: CallPayload) => {
      if (!peerConnectionRef.current || !candidate) return;
      try {
        // If remote description is not set, queue the candidate
        if (!peerConnectionRef.current.remoteDescription) {
          iceCandidateQueue.current.push(candidate);
          return;
        }
        // Otherwise, add the candidate immediately
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("callEnded", ({ senderId }: CallPayload) => {
      endCall();
    });

    socket.on("callRejected", ({ rejecterId }: CallPayload) => {
      setCallStatus("ended");
      setError("Call was rejected by the recipient");
    });

    socket.on("error", ({ message }: { message: string }) => {
      setError(message);
      setCallStatus("idle");
    });

    // Cleanup on unmount
    return () => {
      socket.off("incomingCall");
      socket.off("offer");
      socket.off("answer");
      socket.off("iceCandidate");
      socket.off("callEnded");
      socket.off("callRejected");
      socket.off("error");
      endCall();
    };
  }, [socket, isConnected, recipientId, user?.id]);

  // Start a call
  const startCall = async () => {
    if (!socket || !isConnected || !user?.id) {
      setError("Cannot start call: Not connected or user not authenticated");
      return;
    }
    if (callStatus !== "idle") {
      setError("Cannot start call: Another call is in progress");
      return;
    }
    if (!localVideoRef.current) {
      setError("Video element not available");
      return;
    }

    try {
      // Create new peer connection if none exists
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current!.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("startCall", { recipientId });
      socket.emit("offer", { recipientId, offer });
      setCallStatus("calling");
      setError(null);
    } catch (err) {
      setError("Failed to start call: Camera/microphone access denied");
      console.error("Error starting call:", err);
    }
  };

  // Accept an incoming call
  const acceptCall = async () => {
    if (!socket || !isConnected || !user?.id) {
      setError("Cannot accept call: Not connected or user not authenticated");
      return;
    }
    if (callStatus !== "incoming") {
      setError("No incoming call to accept");
      return;
    }
    if (!localVideoRef.current) {
      setError("Video element not available");
      return;
    }

    try {
      // Create new peer connection if none exists
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = createPeerConnection();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach((track) => {
        peerConnectionRef.current!.addTrack(track, stream);
      });
      setCallStatus("in-call");
      setError(null);
    } catch (err) {
      setError("Failed to accept call: Camera/microphone access denied");
      console.error("Error accepting call:", err);
    }
  };

  // Reject an incoming call
  const rejectCall = (callerId: string) => {
    if (!socket || !isConnected || !user?.id) {
      setError("Cannot reject call: Not connected or user not authenticated");
      return;
    }
    if (callStatus !== "incoming") {
      setError("No incoming call to reject");
      return;
    }

    socket.emit("rejectCall", { callerId });
    setCallStatus("idle");
    setError(null);
  };

  // End the current call
  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (socket && isConnected && callStatus !== "idle") {
      socket.emit("endCall", { recipientId });
    }
    setCallStatus("idle");
    setError(null);
    // Clear ICE candidate queue
    iceCandidateQueue.current = [];
  };

  return {
    callStatus,
    localVideoRef,
    remoteVideoRef,
    error,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
}
