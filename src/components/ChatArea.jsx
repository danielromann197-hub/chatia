import React, { useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import EmptyState from './EmptyState';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatArea = ({ isSidebarOpen, setIsSidebarOpen, messages, isLoading, onSendMessage }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col relative w-full h-full bg-[#212121] overflow-hidden">
      {/* Mobile Header / Sidebar Toggle */}
      {!isSidebarOpen && (
        <div className="md:hidden p-3 flex items-center z-20 bg-transparent absolute top-0 left-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2F2F2F]"
          >
            <Menu size={20} />
          </button>
        </div>
      )}
      
      {/* Desktop Header Top-Left toggle if sidebar closed */}
      {!isSidebarOpen && (
        <div className="hidden md:flex p-3 items-center z-20 bg-transparent absolute top-0 left-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2F2F2F]"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full scrollbar-hide flex flex-col items-center">
        <div className="w-full flex flex-col pt-12 md:pt-14 pb-4 min-h-full justify-between items-center">
          
          <div className="w-full flex-1 flex flex-col items-center">
            {messages.length === 0 ? (
                <EmptyState />
            ) : (
              <div className="flex flex-col justify-start w-full relative">
                {messages.map((msg, index) => (
                  <MessageBubble key={index} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex w-full justify-center px-4 md:px-0 py-6">
                    <div className="flex gap-4 md:gap-5 w-full max-w-3xl">
                      <div className="flex-shrink-0 mt-1">
                         <div className="h-8 w-8 rounded-full border border-[#333333] flex items-center justify-center bg-[#171717] text-[#FFD000]">
                           <div className="flex gap-1 items-center justify-center h-full">
                             <span className="w-1.5 h-1.5 bg-[#FFD000] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                             <span className="w-1.5 h-1.5 bg-[#FFD000] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                             <span className="w-1.5 h-1.5 bg-[#FFD000] rounded-full animate-bounce"></span>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Invisible element at the end for scrolling */}
                <div ref={bottomRef} className="h-4 w-full flex-shrink-0" />
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Chat Input Container */}
      <div className="w-full flex-shrink-0 bg-transparent pointer-events-auto">
         <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
export default ChatArea;
