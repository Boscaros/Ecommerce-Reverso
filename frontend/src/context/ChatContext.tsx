"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ChatWindow {
  offerId: number;
  minimized: boolean;
}

interface ChatContextType {
  activeChats: ChatWindow[];
  openChat: (offerId: number) => void;
  closeChat: (offerId: number) => void;
  toggleMinimize: (offerId: number) => void;
  unreadCountRoot: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChats, setActiveChats] = useState<ChatWindow[]>([]);
  const [unreadCountRoot, setUnreadCountRoot] = useState(0);

  const openChat = (offerId: number) => {
    setActiveChats((prev) => {
      const existing = prev.find(c => c.offerId === offerId);
      if (existing) {
        return prev.map(c => c.offerId === offerId ? { ...c, minimized: false } : c);
      }
      return [...prev, { offerId, minimized: false }];
    });
  };

  const closeChat = (offerId: number) => {
    setActiveChats((prev) => prev.filter(c => c.offerId !== offerId));
  };

  const toggleMinimize = (offerId: number) => {
    setActiveChats((prev) => prev.map(c => c.offerId === offerId ? { ...c, minimized: !c.minimized } : c));
  };

  return (
    <ChatContext.Provider value={{ activeChats, openChat, closeChat, toggleMinimize, unreadCountRoot }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}
