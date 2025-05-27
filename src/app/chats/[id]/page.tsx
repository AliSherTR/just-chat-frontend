"use client";
import dynamic from "next/dynamic";

const SingleChat = dynamic(() => import("@/pages/single-chat"), {
  ssr: false,
});

export default function ChatPage() {
  return <SingleChat />;
}
