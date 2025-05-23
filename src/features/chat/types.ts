export interface Message {
  id: string;
  senderId: string;
  content: string;
  emoji: string;
  createdAt: string;
  isRead: boolean;
  isSentByUser: boolean;
  isPending: boolean;
}

export interface SingleChat {
  chatGroupId: string;
  partner: {
    id: string;
    name: string;
    profilePic: string | null;
  };
  messages: Message[];
}

export interface SingleChatResponse {
  status: string;
  message: string;
  data: SingleChat;
  errors: string | null;
}

export interface ChatUpdatedData {
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
    senderId: string;
  };
  unreadCount: number;
}

export interface Chat {
  chatGroupId: string;
  partnerId: string;
  partnerName: string;
  partnerProfilePic: string | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface ChatsResponse {
  status: string;
  message: string;
  data: Chat[];
  errors: string | null;
}
