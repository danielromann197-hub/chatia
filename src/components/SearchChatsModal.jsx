import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MessageSquare, ChevronRight } from 'lucide-react';

const SearchChatsModal = ({ isOpen, onClose, chats, onSelectChat }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredChats = (chats || []).filter(c => {
    if (!query.trim()) return false; // Show none if empty query
    const lowerQuery = query.toLowerCase();
    const titleMatch = c.title?.toLowerCase().includes(lowerQuery);
    const contentMatch = c.messages?.some(m => m.content?.toLowerCase().includes(lowerQuery));
    return titleMatch || contentMatch;
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-start justify-center pt-20 p-4 animate-fade-in-up backdrop-blur-sm">
      <div className="bg-[#171717] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#333] flex flex-col overflow-hidden max-h-[70vh]">
        
        {/* Search Header */}
        <div className="flex items-center p-4 border-b border-[#333] relative">
          <Search size={20} className="text-[#8E8E8E] absolute left-6" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en todos tus chats..."
            className="w-full bg-transparent text-[#ECECEC] font-poppins text-lg outline-none pl-10 pr-10 py-2"
          />
          <button onClick={onClose} className="p-2 text-[#8E8E8E] hover:text-white hover:bg-[#333] rounded-lg transition-colors absolute right-4">
            <X size={20} />
          </button>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto bg-[#212121] p-2">
          {!query.trim() ? (
            <div className="p-8 text-center text-[#8E8E8E] font-poppins text-sm">
              Escribe algo para encontrar palabras clave en tu historial.
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-[#8E8E8E] font-poppins text-sm">
              No se encontraron resultados para "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full text-left p-4 hover:bg-[#333] rounded-xl transition-colors flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#444] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-[#A0A0A0] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[#ECECEC] font-poppins font-medium text-[15px] truncate">{chat.title}</h4>
                    <p className="text-[#8E8E8E] text-[12px] font-poppins truncate mt-0.5">
                      {chat.messages?.length || 0} mensajes en este hilo
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-[#8E8E8E] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SearchChatsModal;
