import React from 'react';
import { Sparkles, FileText, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { ChatMessage } from '../../lib/data';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex w-full mb-6 animate-slide-up-fade",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[85%] gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs shadow-sm",
          isUser 
            ? "bg-gray-200 text-gray-700 hidden" // Hide user avatar usually
            : "bg-gradient-to-tr from-blue-600 to-cyan-500"
        )}>
          {isUser ? 'U' : <Sparkles size={16} fill="currentColor" />}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <div className={cn(
            "px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm",
            isUser 
              ? "bg-blue-600 text-white rounded-tr-sm" 
              : "bg-white text-gray-800 rounded-tl-sm border border-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
          )}>
            {message.content}
          </div>
          
          {/* Metadata/Actions for AI */}
          {!isUser && (
            <div className="flex items-center gap-3 px-1">
              <span className="text-[10px] text-gray-400">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Copy size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
