import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, FileUp, Mic, Sparkles } from 'lucide-react';
import { MOCK_CHATS, ChatMessage } from '../../lib/data';
import { MessageBubble } from '../ai/MessageBubble';
import { TopBar } from '../layout/TopBar';

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHATS);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Tôi đã nhận được yêu cầu của bạn. Bạn có thể cung cấp thêm thông tin chi tiết về sơ đồ mạch hoặc linh kiện bạn đang tìm kiếm không?",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pt-14 bg-[#F5F7FA] dark:bg-gray-950">
      <TopBar title="AI Engineer Support" showSearch={false} />
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="space-y-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 text-xs ml-12 animate-pulse">
              <Sparkles size={12} />
              <span>AI đang phân tích...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        {/* Suggestion Chips */}
        {messages.length < 3 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
            {["Tư vấn linh kiện Arduino", "Scan sơ đồ mạch", "Tìm thay thế cho chip ESP8266"].map((suggestion) => (
              <button 
                key={suggestion}
                onClick={() => setInputValue(suggestion)}
                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
            <FileUp size={20} />
          </button>
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi AI hoặc tải lên hình ảnh..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 text-sm"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          
          {inputValue.trim() ? (
            <button 
              onClick={handleSend}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          ) : (
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
