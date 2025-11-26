// components/chat/ChatWindow.tsx
"use client";

import { useState } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:3001/chat";

type ChatMessage = {
  message: string;
  sender: "user" | "ChatGPT";
  direction: "incoming" | "outgoing";
};

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      message: "Xin chào! Mình là trợ lý tìm phòng trọ Mình có thể giúp bạn tìm phòng ở khu vực nào ạ?",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (input: string) => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      message: input,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Lỗi mạng");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          message: data.reply || "Mình chưa hiểu, bạn nói lại được không ạ?",
          sender: "ChatGPT",
          direction: "incoming",
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          message: "Mình đang bận chút xíu, bạn thử lại sau 30 giây nhé!",
          sender: "ChatGPT",
          direction: "incoming",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 h-[560px] bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl">AI</span>
          </div>
          <div>
            <h3 className="font-bold">Trợ Lý Tìm Phòng Trọ</h3>
            <p className="text-xs opacity-90">Đang online</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition"
        >
          ×
        </button>
      </div>

      {/* Chat Body */}
      <MainContainer className="flex-1">
        <ChatContainer>
          <MessageList
            typingIndicator={isTyping ? <TypingIndicator content="Đang trả lời..." /> : null}

          >
            {messages.map((msg, i) => (
              <Message
                key={i}
                model={{
                  message: msg.message,
                  direction: msg.direction,
                  sender: msg.sender === "user" ? "Bạn" : "Trợ lý",
                  sentTime: "vừa xong",
                  position: "single",
                }}
              />
            ))}
          </MessageList>

          <MessageInput
            placeholder="Hỏi mình về phòng trọ nhé..."
            onSend={handleSend}
            attachButton={false}
            autoFocus
            className="border-t"
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}