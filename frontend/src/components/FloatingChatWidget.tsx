"use client";

import { useChat } from "@/context/ChatContext";
import FloatingChatWindow from "./FloatingChatWindow";

export default function FloatingChatWidget() {
  const { activeChats } = useChat();

  return (
    <div className="fixed bottom-0 right-4 flex items-end gap-4 z-50 pointer-events-none">
      {activeChats.map((chat) => (
         <div key={chat.offerId} className="pointer-events-auto">
            <FloatingChatWindow offerId={chat.offerId} minimized={chat.minimized} />
         </div>
      ))}
    </div>
  );
}
