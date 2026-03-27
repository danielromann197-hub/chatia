import React from 'react';
import { Plus, MessageSquare, PanelLeftClose, Trash2 } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, chats, currentChatId, onSelectChat, onNewChat, onDeleteChat }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - ChatGPT Style #171717 */}
      <div 
        className={`fixed md:relative inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-[260px] bg-[#171717] flex flex-col h-full`}
      >
        {/* Header Options */}
        <div className="p-3 flex items-center justify-between">
          {/* Collapse button typical in ChatGPT top left */}
          <button 
            className="md:flex hidden text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#202123]"
            onClick={() => setIsOpen(false)}
          >
            <PanelLeftClose size={20} />
          </button>
          
          <button 
            className="md:hidden text-[#B4B4B4] hover:text-white transition-colors p-2"
            onClick={() => setIsOpen(false)}
          >
            <PanelLeftClose size={20} />
          </button>
          
          <div className="flex-1" />
          
          {/* New Chat icon */}
          <button 
            onClick={onNewChat}
            className="text-[#B4B4B4] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#202123]"
            title="Nuevo chat"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Branding inside the sidebar */}
        <div className="px-4 py-2 mt-2 cursor-pointer" onClick={onNewChat}>
          <h1 className="font-anton text-2xl tracking-wide text-white uppercase flex items-baseline">
            CALLE 7 STUDIO<span className="text-[#FFD000] ml-[2px] text-2xl leading-none">.</span>
          </h1>
        </div>

        {/* History Area */}
        <div className="flex-1 overflow-y-auto px-3 mt-6 pb-6">
          <div className="text-[11px] text-[#8E8E8E] font-poppins font-medium mb-3 px-3 uppercase tracking-wider">Historial</div>
          <div className="space-y-1">
            {chats.map((chat) => {
              const isActive = chat.id === currentChatId;
              return (
                <div 
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-between group cursor-pointer ${
                    isActive ? 'bg-[#212121] text-white' : 'text-[#ECECEC] hover:bg-[#202123]'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={isActive ? 'text-white' : 'text-[#8E8E8E] group-hover:text-[#ECECEC] transition-colors'} />
                    <span className="truncate text-[14px] font-poppins font-light relative leading-tight pt-0.5">
                      {chat.title}
                      {/* Fade out effect string overflow */}
                      {!isActive && (
                         <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#171717] group-hover:from-[#202123] to-transparent pointer-events-none" />
                      )}
                      {isActive && (
                         <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#212121] to-transparent pointer-events-none" />
                      )}
                    </span>
                  </div>
                  
                  {/* Delete button (visible on hover) */}
                  <button 
                    onClick={(e) => onDeleteChat(chat.id, e)}
                    className={`text-[#8E8E8E] hover:text-[#ff4a4a] p-1 rounded-md bg-${isActive ? '[#212121]' : '[#202123]'} md:opacity-0 group-hover:opacity-100 transition-opacity z-10 relative`}
                    title="Eliminar chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
