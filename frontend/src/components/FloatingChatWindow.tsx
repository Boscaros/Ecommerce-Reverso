"use client";

import { useEffect, useState, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { Send, Minus, X, Maximize2 } from "lucide-react";

interface Message {
  id?: number;
  sender_id: number;
  text_content: string;
  created_at?: string;
}

export default function FloatingChatWindow({ offerId, minimized }: { offerId: number, minimized: boolean }) {
  const { closeChat, toggleMinimize } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMsg, setCurrentMsg] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    // Fetch historical messages
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/${offerId}/messages`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) setMessages(data);
      })
      .finally(() => setIsLoading(false));
  }, [offerId]);

  useEffect(() => {
    if (user && !isLoading) {
      const token = localStorage.getItem("token");
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/chat/ws/${offerId}/${user.id}?token=${token}`);
      ws.onmessage = (event) => {
         try {
           const incomingMsg = JSON.parse(event.data);
           setMessages(prev => [...prev, incomingMsg]);
           setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
         } catch (e) {
           console.error("Invalid WS message", event.data);
         }
      };
      setSocket(ws);
      return () => ws.close();
    }
  }, [user, isLoading, offerId]);

  // Scroll to bottom when opening
  useEffect(() => {
    if (!minimized) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
    }
  }, [minimized]);

  const handleSend = () => {
    if (!currentMsg.trim() || !socket) return;
    socket.send(currentMsg);
    setCurrentMsg("");
  };

  if (minimized) {
    return (
      <div 
        onClick={() => toggleMinimize(offerId)}
        className="w-72 bg-white border border-meli-border rounded-t-xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)] cursor-pointer flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="font-bold text-meli-dark text-sm truncate">Negociação #{offerId}</span>
        </div>
        <div className="flex items-center gap-1 text-meli-gray">
          <Maximize2 size={16} />
          <button onClick={(e) => { e.stopPropagation(); closeChat(offerId); }} className="hover:text-red-500 p-1">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[340px] h-[450px] bg-white border border-meli-border rounded-t-xl shadow-[0_-8px_20px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden">
      {/* Header */}
      <div 
        onClick={() => toggleMinimize(offerId)}
        className="bg-meli-blue text-white p-3 flex justify-between items-center cursor-pointer hover:bg-blue-700 transition-colors"
      >
        <div className="flex items-center gap-2">
           <span className="font-bold text-sm">Negociação #{offerId}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); toggleMinimize(offerId); }} className="p-1 hover:bg-white/20 rounded">
            <Minus size={18} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); closeChat(offerId); }} className="p-1 hover:bg-white/20 rounded">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-meli-bg p-4 overflow-y-auto flex flex-col">
        {isLoading ? (
          <div className="m-auto text-meli-gray text-sm">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="m-auto text-meli-gray text-sm text-center">
            Nenhuma mensagem ainda.<br/>Inicie a conversa!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const senderName = isMe ? "Você" : `Usuário #${msg.sender_id}`;
            const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
            
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
                <span className="text-[10px] text-meli-gray mb-0.5 px-1">{senderName}</span>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm relative shadow-sm ${isMe ? 'bg-meli-blue text-white rounded-tr-sm' : 'bg-white text-meli-dark border border-meli-border rounded-tl-sm'}`}>
                  <p className="whitespace-pre-wrap break-words">{msg.text_content}</p>
                  <span className={`text-[9px] block mt-1 ${isMe ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                    {timeStr}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-meli-border flex gap-2">
        <input 
          type="text" 
          value={currentMsg}
          onChange={(e) => setCurrentMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' ? handleSend() : null}
          placeholder="Escreva uma mensagem..."
          className="flex-1 bg-gray-50 border border-meli-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-meli-blue"
        />
        <button 
          onClick={handleSend}
          disabled={!currentMsg.trim()}
          className="bg-meli-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
