import Link from "next/link";

type SideBarChatItemProps = {
  chatGroupId: string;
  partnerId: string;
  partnerName: string;
  partnerProfilePic: string | null;
  lastMessage: {
    id: string;
    content: string;
    emoji: string;
    createdAt: string;
    isSentByUser: boolean;
  };
};

function formatTimestamp(createdAt: string): string {
  const date = new Date(createdAt);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString();
}

export default function SingleChatItem({
  chatGroupId,
  partnerName,
  partnerProfilePic,
  lastMessage,
}: SideBarChatItemProps) {
  const truncateMessage = (content: string): string => {
    const words = content.split(" ");
    if (words.length > 3) {
      return words.slice(0, 3).join(" ") + "...";
    }
    return content;
  };

  return (
    <Link href={`/chats/${chatGroupId}`}>
      <div className="py-1 px-2 flex items-center border rounded-3xl gap-2  transition">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
          {partnerProfilePic ? (
            <img
              src={partnerProfilePic}
              alt={`${partnerName} avatar`}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            partnerName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="text-xs flex-1">
          <h1 className="font-semibold text-gray-800 dark:text-white">
            {partnerName}
          </h1>
          <span className="truncate text-gray-600 dark:text-white">
            {lastMessage.isSentByUser ? "You: " : ""}
            {truncateMessage(lastMessage.content)}
            {lastMessage.emoji && ` ${lastMessage.emoji}`}
          </span>
        </div>
        <div className="justify-self-end text-xs">
          <p className="text-right text-gray-500 dark:text-white">
            {formatTimestamp(lastMessage.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
