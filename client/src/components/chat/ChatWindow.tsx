"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, Send, Settings, Bot, User, RefreshCw, Copy, Check, 
  MessageSquare, Home, FileText, Shield, Wifi, Car
} from "lucide-react";
import type { ChatMessage, ChatResponse, AIModel } from "../../types/chat";

// Base URL cho Express server API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  console.log('🔧 ChatWindow mounted with API_BASE_URL:', API_BASE_URL);
  
  // Khởi tạo state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Xin chào! 👋 Tôi là trợ lý AI chuyên về tìm phòng trọ cho sinh viên. Tôi có thể giúp bạn:\n\n• Tìm phòng trọ theo khu vực, giá cả\n• Tư vấn hợp đồng thuê nhà\n• Giải đáp về tiện ích, an ninh, điện nước\n• So sánh các khu vực và mức giá\n\nBạn đang tìm phòng ở khu vực nào và có ngân sách khoảng bao nhiêu ạ?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [selectedModel, setSelectedModel] = useState("deepseek/deepseek-chat");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0, total: 0 });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Danh sách AI models
  const models: AIModel[] = [
    { value: "deepseek/deepseek-chat", label: "DeepSeek Chat", description: "Mạnh mẽ và chính xác - Mặc định" },
    { value: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B", description: "Nhanh và hiệu quả" },
    { value: "google/gemma-2-9b-it", label: "Gemma 2 9B", description: "Google AI chất lượng cao" },
    { value: "microsoft/phi-3-medium-4k-instruct", label: "Phi-3 Medium", description: "Microsoft tối ưu" },
    { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "ChatGPT phổ biến" },
    { value: "anthropic/claude-3-haiku", label: "Claude 3 Haiku", description: "Anthropic - Nhanh nhất" },
  ];

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto focus input khi không typing
  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

  // Check API connection khi component mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  // Kiểm tra kết nối API
  const checkApiConnection = useCallback(async () => {
    console.log('🔄 Checking API connection...');
    setApiStatus("checking");
    setConnectionError(null);
    
    try {
      const url = `${API_BASE_URL}/chat/test`;
      console.log('🔄 Testing URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      console.log('🔄 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connected:', data);
        setApiStatus("connected");
      } else {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        setApiStatus("disconnected");
        setConnectionError(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ API connection failed:', error);
      setApiStatus("disconnected");
      setConnectionError(`Cannot connect to server at ${API_BASE_URL}. Make sure Express server is running.`);
    }
  }, []);

  // Gửi tin nhắn
  const handleSend = useCallback(async () => {
    console.log('🟡 handleSend called with input:', input);
    
    if (!input.trim() || isTyping) {
      console.log('🔴 Cannot send: empty input or typing');
      return;
    }

    // Thêm tin nhắn người dùng vào state
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      // Chuẩn bị messages cho API
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.sender === "bot" ? "assistant" as const : "user" as const,
        content: msg.content
      }));

      console.log('🟢 Sending to:', `${API_BASE_URL}/chat`);
      console.log('🟢 Request payload:', {
        messages: apiMessages,
        model: selectedModel
      });

      // Gửi request đến API
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          messages: apiMessages,
          model: selectedModel
        }),
      });

      console.log('🟢 Response status:', response.status);
      
      // Xử lý lỗi HTTP
      if (!response.ok) {
        let errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          if (errorText) errorMessage += ` - ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      // Parse response
      const data: ChatResponse = await response.json();
      console.log('🟢 Response data:', data);

      if (data.success && data.reply) {
        // Thêm tin nhắn bot vào state
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.reply,
          sender: "bot",
          timestamp: new Date(),
          model: data.model
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Cập nhật token usage nếu có
        if (data.usage) {
          setTokenUsage({
            prompt: data.usage.prompt_tokens || 0,
            completion: data.usage.completion_tokens || 0,
            total: data.usage.total_tokens || 0
          });
        }
      } else {
        throw new Error(data.error || "No reply received from AI");
      }
    } catch (error) {
      console.error("❌ Chat error:", error);
      
      const errorMessageText = error instanceof Error ? error.message : "Unknown error";
      
      // Thêm tin nhắn lỗi
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `❌ Có lỗi xảy ra: ${errorMessageText}. Vui lòng thử lại sau.`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Kiểm tra lại kết nối nếu là lỗi mạng
      if (errorMessageText.includes('fetch') || errorMessageText.includes('network')) {
        setApiStatus("disconnected");
        setConnectionError(`Network error: ${errorMessageText}`);
      }
    } finally {
      setIsTyping(false);
      // Focus lại input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isTyping, messages, selectedModel]);

  // Xử lý phím Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Copy tin nhắn
  const copyToClipboard = useCallback(async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Xóa chat
  const clearChat = useCallback(() => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) {
      setMessages([
        {
          id: "1",
          content: "Chat đã được xóa. Tôi có thể giúp gì cho bạn?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setTokenUsage({ prompt: 0, completion: 0, total: 0 });
    }
  }, []);

  // Câu hỏi nhanh
  const quickQuestions = [
    { icon: <Home className="w-3 h-3" />, text: "Tìm phòng trọ quận 1 giá dưới 3 triệu", category: "Tìm phòng" },
    { icon: <FileText className="w-3 h-3" />, text: "Cần chú ý gì khi ký hợp đồng thuê nhà?", category: "Hợp đồng" },
    { icon: <Shield className="w-3 h-3" />, text: "An ninh khu vực này tốt không?", category: "An ninh" },
    { icon: <Wifi className="w-3 h-3" />, text: "Phòng trọ có internet không?", category: "Tiện ích" },
    { icon: <Car className="w-3 h-3" />, text: "Phòng trọ có chỗ để xe không?", category: "Tiện ích" },
    { icon: <MessageSquare className="w-3 h-3" />, text: "Tư vấn phòng trọ cho sinh viên mới ra trường", category: "Tư vấn" }
  ];

  // Format message content
  const formatMessageContent = useCallback((content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^•\s*(.*)$/gm, '• $1')
      .replace(/\n/g, '<br>');
  }, []);

  // Kiểm tra server trước khi gửi
  const testServerBeforeSend = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        return true;
      } else {
        const errorText = await response.text();
        throw new Error(`Server test failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Server test error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setApiStatus("disconnected");
      setConnectionError(`Cannot connect to server: ${errorMessage}`);
      return false;
    }
  }, []);

  return (
    <div className="fixed bottom-24 right-6 z-50 w-full max-w-md h-[600px] bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold">Trợ Lý Tìm Phòng Trọ</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${
                apiStatus === "connected" ? "bg-green-400" : 
                apiStatus === "disconnected" ? "bg-red-400" : "bg-yellow-400 animate-pulse"
              }`} />
              <span>
                {apiStatus === "connected" ? "Đang online" : 
                 apiStatus === "disconnected" ? "Mất kết nối" : "Đang kiểm tra..."}
              </span>
              {apiStatus === "disconnected" && (
                <button 
                  onClick={checkApiConnection}
                  className="text-xs underline hover:no-underline ml-2 flex items-center gap-1"
                >
                  <RefreshCw size={10} />
                  Thử lại
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition"
            title="Cài đặt AI"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition"
            title="Đóng chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Connection Error Banner */}
      {apiStatus === "disconnected" && connectionError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-500">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{connectionError}</p>
              <div className="flex gap-2 mt-1">
                <button 
                  onClick={checkApiConnection}
                  className="text-sm text-red-600 underline hover:no-underline"
                >
                  Thử kết nối lại
                </button>
                <button 
                  onClick={() => window.open(API_BASE_URL, '_blank')}
                  className="text-sm text-blue-600 underline hover:no-underline"
                >
                  Kiểm tra server
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {models.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label} - {model.description}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Model hiện tại:</strong> {models.find(m => m.value === selectedModel)?.label}</p>
            <p><strong>Trạng thái:</strong> 
              <span className={`ml-2 font-medium ${
                apiStatus === "connected" ? "text-green-600" : 
                apiStatus === "disconnected" ? "text-red-600" : "text-yellow-600"
              }`}>
                {apiStatus === "connected" ? "✅ Đang hoạt động" : 
                 apiStatus === "disconnected" ? "❌ Mất kết nối" : "🔄 Đang kiểm tra..."}
              </span>
            </p>
            <p><strong>Server URL:</strong> {API_BASE_URL}</p>
            <p><strong>Token sử dụng:</strong> {tokenUsage.total} tokens</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={checkApiConnection}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
              >
                <RefreshCw size={12} />
                Kiểm tra kết nối
              </button>
              <button
                onClick={clearChat}
                className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              >
                Xóa lịch sử
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Questions */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
          <MessageSquare size={12} />
          💡 Câu hỏi nhanh:
        </p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={async () => {
                if (apiStatus === "disconnected") {
                  const isConnected = await testServerBeforeSend();
                  if (!isConnected) return;
                }
                setInput(question.text);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 transition whitespace-nowrap flex items-center gap-1"
              title={question.text}
              disabled={apiStatus === "disconnected"}
            >
              {question.icon}
              <span className="max-w-[120px] truncate">{question.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 relative group ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                    : msg.content.includes("❌")
                    ? "bg-red-50 border border-red-200 shadow-sm rounded-bl-none"
                    : "bg-white border border-gray-200 shadow-sm rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {msg.sender === "bot" ? (
                      <Bot size={14} className={msg.content.includes("❌") ? "text-red-500" : "text-blue-500"} />
                    ) : (
                      <User size={14} className="text-white/80" />
                    )}
                    <span className="text-xs font-medium">
                      {msg.sender === "bot" ? "Trợ lý AI" : "Bạn"}
                    </span>
                    {msg.sender === "bot" && msg.model && !msg.content.includes("❌") && (
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        {msg.model.split('/')[1] || msg.model}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                      msg.sender === "user" ? "text-white/70 hover:text-white" : 
                      msg.content.includes("❌") ? "text-red-400 hover:text-red-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                    title="Sao chép tin nhắn"
                  >
                    {copiedMessageId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div 
                  className="whitespace-pre-wrap text-sm"
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className={`text-xs ${
                    msg.sender === "user" ? "text-white/70" : 
                    msg.content.includes("❌") ? "text-red-500" : "text-gray-500"
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={14} className="text-blue-500" />
                  <span className="text-xs font-medium">Trợ lý AI</span>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    {selectedModel.split('/')[1] || selectedModel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Đang tư vấn...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Debug Panel - Chỉ hiển thị trong development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t border-gray-200 p-2 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={async () => {
                console.log('🧪 Test GET request');
                try {
                  const response = await fetch(`${API_BASE_URL}/chat/test`);
                  const data = await response.json();
                  console.log('✅ GET test:', data);
                  alert(`GET test: ${JSON.stringify(data)}`);
                } catch (error) {
                  console.error('❌ GET test error:', error);
                  alert(`GET test error: ${error}`);
                }
              }}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test GET
            </button>
            <button
              onClick={async () => {
                console.log('🧪 Test POST request');
                try {
                  const response = await fetch(`${API_BASE_URL}/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                      messages: [{ role: "user", content: "Xin chào" }],
                      model: selectedModel
                    }),
                  });
                  const data = await response.json();
                  console.log('✅ POST test:', data);
                  alert(`POST test: ${JSON.stringify(data)}`);
                } catch (error) {
                  console.error('❌ POST test error:', error);
                  alert(`POST test error: ${error}`);
                }
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test POST
            </button>
            <button
              onClick={() => {
                console.log('🧪 Current state:', {
                  apiStatus,
                  selectedModel,
                  messagesCount: messages.length,
                  tokenUsage
                });
              }}
              className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Log State
            </button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi về phòng trọ, hợp đồng, giá cả..."
              className="w-full p-3 pr-12 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50 min-h-[44px] max-h-[120px]"
              rows={1}
              disabled={apiStatus === "disconnected" || isTyping}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-400">
              {apiStatus === "disconnected" ? "Đang mất kết nối..." : isTyping ? "AI đang trả lời..." : "Enter để gửi"}
            </div>
          </div>
          <button
            onClick={async () => {
              if (apiStatus === "disconnected") {
                const isConnected = await testServerBeforeSend();
                if (!isConnected) return;
              }
              handleSend();
            }}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center min-w-[48px] h-[44px]"
            title="Gửi tin nhắn"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center flex justify-between items-center">
          <span>
            {tokenUsage.total > 0 && `Đã dùng: ${tokenUsage.total} tokens`}
          </span>
          <span className="text-gray-400">
            {apiStatus === "connected" ? "✅ Đang kết nối" : "❌ Mất kết nối"} • {API_BASE_URL}
          </span>
        </div>
      </div>
    </div>
  );
}