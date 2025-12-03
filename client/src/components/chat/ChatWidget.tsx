// components/chat/ChatWidget.tsx
"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import { MessageCircle } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút chat nổi – toggle mở/đóng */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label={isOpen ? "Đóng trợ lý" : "Mở trợ lý"}
      >
        <MessageCircle size={32} strokeWidth={2.5} />

        {/* Chấm báo hiệu */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
      </button>

      {/* Cửa sổ chat – chỉ hiện khi mở */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}
