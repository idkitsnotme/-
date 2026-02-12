
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg
          ${isUser ? 'bg-[#FF4B4B]' : 'bg-[#000000] border border-[#444]'}`}>
          {isUser ? '🔴' : '🤖'}
        </div>
        
        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`p-4 rounded-2xl shadow-md ${
            isUser 
              ? 'bg-[#4A4A4A] text-white rounded-tr-none' 
              : message.error 
                ? 'bg-red-900/40 border border-red-500 text-red-100 rounded-tl-none'
                : 'bg-[#3D3D3D] text-white rounded-tl-none border border-[#444]'
          }`}>
            {message.image && (
              <div className="mb-3 overflow-hidden rounded-lg">
                <img 
                  src={`data:${message.image.mimeType};base64,${message.image.data}`} 
                  alt="Uploaded content" 
                  className="max-w-full h-auto max-h-64 object-contain"
                />
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {message.content}
            </p>
          </div>
          
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
