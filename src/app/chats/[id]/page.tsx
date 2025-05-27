"use client";
import dynamic from "next/dynamic";

const SingleChat = dynamic(
  () => import("@/features/chat/components/single-chat"),
  {
    ssr: false,
  }
);

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <SingleChat />;
}
