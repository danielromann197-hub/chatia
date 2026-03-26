import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full flex justify-center px-4 pb-2 md:pb-6 relative z-10">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end bg-[#2F2F2F] rounded-3xl px-2 py-2 shadow-sm w-full"
        >
          <div className="flex-1 flex items-center min-h-[40px]">
             <textarea
               ref={textareaRef}
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Mensaje en C7 AI..."
               className="w-full bg-transparent text-[#ECECEC] placeholder-[#8E8E8E] focus:outline-none resize-none px-4 py-[10px] font-poppins text-[16px] scrollbar-hide align-middle"
               rows={1}
               style={{ maxHeight: '200px', display: 'block' }}
               disabled={isLoading}
             />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 m-[2px] h-[34px] w-[34px] rounded-full bg-[#ECECEC] flex items-center justify-center transition-all duration-200 text-black shadow-sm disabled:opacity-40 disabled:bg-[#424242] disabled:text-[#8E8E8E] focus:outline-none"
            style={ (!message.trim() || isLoading) ? {} : { backgroundColor: '#FFD000', color: 'black' } }
          >
            <ArrowUp size={18} strokeWidth={3} />
          </button>
        </form>
        <div className="text-center mt-2 mb-1">
          <p className="text-[11px] text-[#A3A3A3] font-poppins">
            C7 AI puede cometer errores. Considera verificar la información importante.
          </p>
        </div>
      </div>
    </div>
  );
};
export default ChatInput;
