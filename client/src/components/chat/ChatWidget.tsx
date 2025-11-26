// components/chat/ChatWidget.tsx
"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import { MessageCircle } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút chat nổi */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110"
        aria-label="Mở trợ lý tìm phòng"
      >
        <MessageCircle size={32} strokeWidth={2.5} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
      </button>

      {/* Chat Window – chỉ hiện khi mở */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}