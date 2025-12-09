"use client";

import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import { MessageCircle, X } from "lucide-react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Hiển thị thông báo sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!notificationDismissed && !isOpen) {
        setShowNotification(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [notificationDismissed, isOpen]);

  // Đóng thông báo khi mở chat
  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
    }
  }, [isOpen]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationDismissed(true);
  };

  return (
    <>
      {/* Notification Bubble */}
      {showNotification && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">Trợ lý AI</h4>
                  <button
                    onClick={handleCloseNotification}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Đóng thông báo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Chào bạn! Tôi có thể giúp bạn tìm phòng trọ phù hợp. Nhấn để bắt đầu chat!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nút chat nổi */}
      <button
        onClick={() => {
          setIsOpen(prev => !prev);
          setShowNotification(false);
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/50 group"
        aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý tìm phòng trọ"}
      >
        <MessageCircle 
          size={28} 
          strokeWidth={2} 
          className={`transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}
        />
        
        {/* Chấm báo hiệu đang online */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        
        {/* Tooltip */}
        <div className="absolute right-16 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
            {isOpen ? "Đóng chat" : "Mở trợ lý AI"}
          </div>
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      </button>

      {/* Cửa sổ chat */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}
